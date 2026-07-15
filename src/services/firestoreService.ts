import { getDb, USERS_COLLECTION } from '../lib/firebase';

let _auth: any = null;
function auth() {
  if (!_auth) _auth = require('@react-native-firebase/auth').default();
  return _auth;
}
import {
  Treino, TreinoCompleto, PerfilUsuario, RecordesMap, RecordeExercicio,
  MedidaCorporal, ConfigAgua, RegistroAguaDiario, CopoAgua, CardioEntry, Exercicio,
} from '../types';
import {
  carregarTreinos as loadTreinosLocal,
  salvarTreinos as saveTreinosLocal,
  salvarTreino as saveTreinoLocal,
  carregarHistorico as loadHistoricoLocal,
  salvarHistorico as saveHistoricoLocal,
  carregarPerfil as loadPerfilLocal,
  salvarPerfil as savePerfilLocal,
  carregarRecordes as loadRecordesLocal,
  salvarRecordes as saveRecordesLocal,
  carregarMedidas as loadMedidasLocal,
  salvarMedida as saveMedidaLocal,
  deletarMedida as deleteMedidaLocal,
  carregarConfigAgua as loadConfigAguaLocal,
  salvarConfigAgua as saveConfigAguaLocal,
  carregarRegistroAgua as loadRegistroAguaLocal,
  salvarRegistroAgua as saveRegistroAguaLocal,
  adicionarCopoAgua as addCopoLocal,
  carregarCardio as loadCardioLocal,
  salvarCardioEntry as saveCardioEntryLocal,
  deletarCardioEntry as deleteCardioEntryLocal,
  carregarExerciciosPersonalizados as loadExerciciosCustomLocal,
  salvarExerciciosPersonalizados as saveExerciciosCustomLocal,
  gerarId,
  limparStorage,
} from '../utils/storage';

function getUid(): string | null {
  return auth().currentUser?.uid ?? null;
}

function userRef() {
  const uid = getUid();
  if (!uid) throw new Error('Usuário não autenticado');
  return getDb().collection(USERS_COLLECTION).doc(uid);
}

// ─── Treinos ───

export async function carregarTreinos(): Promise<Treino[]> {
  try {
    const snap = await userRef().collection('treinos').get();
    const dados = snap.docs.map(d => ({ id: d.id, ...d.data() } as Treino));
    if (dados.length > 0) {
      await saveTreinosLocal(dados);
      return dados;
    }
    return loadTreinosLocal();
  } catch {
    return loadTreinosLocal();
  }
}

export async function salvarTreino(treino: Treino): Promise<void> {
  await saveTreinoLocal(treino);
  try {
    await userRef().collection('treinos').doc(treino.id).set(treino);
  } catch (e) {
    console.warn('Erro ao salvar treino no Firestore:', e);
  }
}

export async function deletarTreino(id: string): Promise<void> {
  const { deletarTreino } = await import('../utils/storage');
  await deletarTreino(id);
  try {
    await userRef().collection('treinos').doc(id).delete();
  } catch (e) {
    console.warn('Erro ao deletar treino no Firestore:', e);
  }
}

// ─── Histórico ───

export async function carregarHistorico(): Promise<TreinoCompleto[]> {
  try {
    const snap = await userRef().collection('historico').orderBy('dataExecucao', 'desc').get();
    const dados = snap.docs.map(d => ({ ...d.data() } as TreinoCompleto));
    if (dados.length > 0) return dados;
    const local = await loadHistoricoLocal();
    return local.sort((a, b) => new Date(b.dataExecucao).getTime() - new Date(a.dataExecucao).getTime());
  } catch {
    const local = await loadHistoricoLocal();
    return local.sort((a, b) => new Date(b.dataExecucao).getTime() - new Date(a.dataExecucao).getTime());
  }
}

export async function salvarHistorico(treino: TreinoCompleto): Promise<void> {
  await saveHistoricoLocal(treino);
  try {
    await userRef().collection('historico').doc(treino.dataExecucao).set(treino);
  } catch (e) {
    console.warn('Erro ao salvar histórico no Firestore:', e);
  }
}

// ─── Perfil ───

export async function carregarPerfil(): Promise<PerfilUsuario | null> {
  try {
    const doc = await userRef().get();
    const perfil = doc.data()?.profile as PerfilUsuario | undefined;
    if (perfil) {
      await savePerfilLocal(perfil);
      return perfil;
    }
    return loadPerfilLocal();
  } catch {
    return loadPerfilLocal();
  }
}

export async function salvarPerfil(perfil: PerfilUsuario): Promise<void> {
  await savePerfilLocal(perfil);
  try {
    await userRef().set({ profile: perfil }, { merge: true });
  } catch (e) {
    console.warn('Erro ao salvar perfil no Firestore:', e);
  }
}

// ─── Recordes ───

export async function carregarRecordes(): Promise<RecordesMap> {
  try {
    const snap = await userRef().collection('recordes').get();
    const recordes: RecordesMap = {};
    snap.docs.forEach(d => { recordes[d.id] = d.data() as RecordeExercicio; });
    if (Object.keys(recordes).length > 0) {
      await saveRecordesLocal(recordes);
      return recordes;
    }
    return loadRecordesLocal();
  } catch {
    return loadRecordesLocal();
  }
}

export async function salvarRecordes(recordes: RecordesMap): Promise<void> {
  await saveRecordesLocal(recordes);
  try {
    const batch = getDb().batch();
    for (const [id, rec] of Object.entries(recordes)) {
      batch.set(userRef().collection('recordes').doc(id), rec);
    }
    await batch.commit();
  } catch (e) {
    console.warn('Erro ao salvar recordes no Firestore:', e);
  }
}

export async function verificarNovoRecorde(
  exercicioId: string, carga: number, repeticoes: number
): Promise<boolean> {
  const recordes = await carregarRecordes();
  const atual = recordes[exercicioId];
  if (!atual || carga > atual.carga) {
    const novo: RecordeExercicio = { carga, repeticoes, data: new Date().toISOString() };
    recordes[exercicioId] = novo;
    await salvarRecordes(recordes);
    return true;
  }
  return false;
}

// ─── Medidas ───

export async function carregarMedidas(): Promise<MedidaCorporal[]> {
  try {
    const snap = await userRef().collection('medidas').orderBy('data', 'desc').get();
    const dados = snap.docs.map(d => ({ id: d.id, ...d.data() } as MedidaCorporal));
    if (dados.length > 0) return dados;
    return loadMedidasLocal();
  } catch {
    return loadMedidasLocal();
  }
}

export async function salvarMedida(medida: MedidaCorporal): Promise<void> {
  await saveMedidaLocal(medida);
  try {
    await userRef().collection('medidas').doc(medida.id).set(medida);
  } catch (e) {
    console.warn('Erro ao salvar medida no Firestore:', e);
  }
}

export async function deletarMedida(id: string): Promise<void> {
  await deleteMedidaLocal(id);
  try {
    await userRef().collection('medidas').doc(id).delete();
  } catch (e) {
    console.warn('Erro ao deletar medida no Firestore:', e);
  }
}

// ─── Água ───

export async function carregarConfigAgua(): Promise<ConfigAgua> {
  try {
    const doc = await userRef().get();
    const config = doc.data()?.aguaConfig as ConfigAgua | undefined;
    if (config) {
      await saveConfigAguaLocal(config);
      return config;
    }
    return loadConfigAguaLocal();
  } catch {
    return loadConfigAguaLocal();
  }
}

export async function salvarConfigAgua(config: ConfigAgua): Promise<void> {
  await saveConfigAguaLocal(config);
  try {
    await userRef().set({ aguaConfig: config }, { merge: true });
  } catch (e) {
    console.warn('Erro ao salvar config água no Firestore:', e);
  }
}

export async function carregarRegistroAgua(): Promise<RegistroAguaDiario[]> {
  try {
    const snap = await userRef().collection('aguaRegistros').get();
    const dados = snap.docs.map(d => ({ data: d.id, ...d.data() } as RegistroAguaDiario));
    if (dados.length > 0) return dados;
    return loadRegistroAguaLocal();
  } catch {
    return loadRegistroAguaLocal();
  }
}

export async function adicionarCopoAgua(ml: number): Promise<RegistroAguaDiario> {
  const hoje = new Date().toISOString().split('T')[0];
  const copo: CopoAgua = { timestamp: new Date().toISOString(), ml };
  const registro = await addCopoLocal(ml);

  try {
    const docRef = userRef().collection('aguaRegistros').doc(hoje);
    const doc = await docRef.get();
    if (doc.data()) {
      const existente = doc.data() as RegistroAguaDiario;
      existente.copos.push(copo);
      await docRef.set(existente);
    } else {
      await docRef.set({ data: hoje, copos: [copo] });
    }
  } catch (e) {
    console.warn('Erro ao salvar copo no Firestore:', e);
  }

  return registro;
}

// ─── Local-only read exports (instant, no network) ───

export const carregarTreinosLocal = loadTreinosLocal;
export const carregarHistoricoLocal = loadHistoricoLocal;
export const carregarPerfilLocal = loadPerfilLocal;
export const carregarCardioLocal = loadCardioLocal;
export const carregarConfigAguaLocal = loadConfigAguaLocal;
export const carregarRegistroAguaLocal = loadRegistroAguaLocal;

// ─── Cardio ───

export async function carregarCardio(): Promise<CardioEntry[]> {
  try {
    const snap = await userRef().collection('cardio').orderBy('timestamp', 'desc').get();
    const dados = snap.docs.map(d => ({ id: d.id, ...d.data() } as CardioEntry));
    if (dados.length > 0) return dados;
    return loadCardioLocal();
  } catch {
    return loadCardioLocal();
  }
}

export async function salvarCardioEntry(entry: CardioEntry): Promise<void> {
  await saveCardioEntryLocal(entry);
  try {
    await userRef().collection('cardio').doc(entry.id).set(entry);
  } catch (e) {
    console.warn('Erro ao salvar cardio no Firestore:', e);
  }
}

export async function deletarCardioEntry(id: string): Promise<void> {
  await deleteCardioEntryLocal(id);
  try {
    await userRef().collection('cardio').doc(id).delete();
  } catch (e) {
    console.warn('Erro ao deletar cardio no Firestore:', e);
  }
}

// ─── Exercícios Personalizados ───

export const carregarExerciciosPersonalizadosLocal = loadExerciciosCustomLocal;

export async function carregarExerciciosPersonalizados(): Promise<Exercicio[]> {
  try {
    const doc = await userRef().get();
    const dados = doc.data()?.customExercises as Exercicio[] | undefined;
    if (dados && dados.length > 0) {
      await saveExerciciosCustomLocal(dados);
      return dados;
    }
    const locais = await loadExerciciosCustomLocal();
    if (locais.length > 0) {
      await userRef().set({ customExercises: locais }, { merge: true });
      return locais;
    }
    return [];
  } catch {
    return loadExerciciosCustomLocal();
  }
}

export async function salvarExerciciosPersonalizados(exercicios: Exercicio[]): Promise<void> {
  await saveExerciciosCustomLocal(exercicios);
  try {
    await userRef().set({ customExercises: exercicios }, { merge: true });
  } catch (e) {
    console.warn('Erro ao salvar exercícios personalizados no Firestore:', e);
  }
}

export async function limparTodosDados(): Promise<void> {
  const uid = getUid();
  if (uid) {
    const SUBCOLLECTIONS = ['treinos', 'historico', 'recordes', 'medidas', 'aguaRegistros', 'cardio'];
    const userDoc = getDb().collection(USERS_COLLECTION).doc(uid);
    for (const sub of SUBCOLLECTIONS) {
      try {
        const snap = await userDoc.collection(sub).get();
        const batch = getDb().batch();
        snap.docs.forEach(d => batch.delete(d.ref));
        await batch.commit();
      } catch (e) {
        console.warn(`Erro ao limpar subcoleção ${sub}:`, e);
      }
    }
    try {
      await userDoc.delete();
    } catch (e) {
      console.warn('Erro ao deletar documento do usuário:', e);
    }
  }
  await limparStorage();
  try {
    await auth().signOut();
  } catch (e) {
    console.warn('Erro ao fazer signOut:', e);
  }
}
