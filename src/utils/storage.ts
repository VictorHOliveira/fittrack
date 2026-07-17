import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Treino,
  TreinoCompleto,
  PerfilUsuario,
  TreinoPreDefinido,
  RecordesMap,
  MedidaCorporal,
  ConfigAgua,
  RegistroAguaDiario,
  CopoAgua,
  CardioEntry,
  Exercicio,
  ExercicioExecucao,
} from '../types';
import treinosPreDefinidos from '../data/treinos-pre-definidos.json';
import { gerarId, formatarDuracao, formatarData } from './format';

export { gerarId, formatarDuracao, formatarData };

const STORAGE_VERSION_KEY = '@storageVersion';
const CURRENT_VERSION = 1;

const TREINOS_KEY = '@treinos';
const HISTORICO_KEY = '@historico';
const PERFIL_KEY = '@perfil';
const RECORDES_KEY = '@recordes';
const MEDIDAS_KEY = '@medidas';
const AGUA_CONFIG_KEY = '@configAgua';
const AGUA_REGISTRO_KEY = '@registroAgua';
const CARDIO_KEY = '@cardio';
const HISTORICO_DELETADOS_KEY = '@historicoDeletados';

export async function getStorageVersion(): Promise<number> {
  const v = await AsyncStorage.getItem(STORAGE_VERSION_KEY);
  return v ? parseInt(v, 10) : 0;
}

export async function checkAndMigrateStorage(): Promise<void> {
  const version = await getStorageVersion();
  if (version >= CURRENT_VERSION) return;

  // Migrar dados aqui conforme necessário
  // Exemplo:
  // if (version < 1) { migrateV1(); }

  try {
    await AsyncStorage.setItem(STORAGE_VERSION_KEY, String(CURRENT_VERSION));
  } catch {
    /* Falha silenciosa */
  }
}

export async function salvarTreinos(treinos: Treino[]): Promise<void> {
  try {
    await AsyncStorage.setItem(TREINOS_KEY, JSON.stringify(treinos));
  } catch {
    /* Falha silenciosa */
  }
}

export async function carregarTreinos(): Promise<Treino[]> {
  const dados = await AsyncStorage.getItem(TREINOS_KEY);
  if (!dados) return [];
  try {
    return JSON.parse(dados);
  } catch {
    return [];
  }
}

export async function salvarTreino(treino: Treino): Promise<void> {
  const treinos = await carregarTreinos();
  const index = treinos.findIndex((t) => t.id === treino.id);
  if (index >= 0) {
    treinos[index] = treino;
  } else {
    treinos.push(treino);
  }
  await salvarTreinos(treinos);
}

export async function deletarTreino(id: string): Promise<void> {
  const treinos = await carregarTreinos();
  const filtrados = treinos.filter((t) => t.id !== id);
  await salvarTreinos(filtrados);
}

export async function salvarHistorico(treino: TreinoCompleto): Promise<void> {
  const historico = await carregarHistorico();
  const index = historico.findIndex(
    (h) => h.dataExecucao === treino.dataExecucao,
  );
  if (index >= 0) {
    historico[index] = treino;
  } else {
    historico.push(treino);
  }
  try {
    await AsyncStorage.setItem(HISTORICO_KEY, JSON.stringify(historico));
  } catch {
    /* Falha silenciosa */
  }
}

export async function salvarHistoricos(
  treinos: TreinoCompleto[],
): Promise<void> {
  try {
    await AsyncStorage.setItem(HISTORICO_KEY, JSON.stringify(treinos));
  } catch {
    /* Falha silenciosa */
  }
}

export async function carregarHistorico(): Promise<TreinoCompleto[]> {
  const dados = await AsyncStorage.getItem(HISTORICO_KEY);
  if (!dados) return [];
  try {
    return JSON.parse(dados);
  } catch {
    return [];
  }
}

export async function deletarHistorico(dataExecucao: string): Promise<void> {
  const historico = await carregarHistorico();
  const filtrados = historico.filter((h) => h.dataExecucao !== dataExecucao);
  try {
    await AsyncStorage.setItem(HISTORICO_KEY, JSON.stringify(filtrados));
  } catch {
    /* Falha silenciosa */
  }
}

export async function carregarHistoricoDeletados(): Promise<string[]> {
  const dados = await AsyncStorage.getItem(HISTORICO_DELETADOS_KEY);
  if (!dados) return [];
  try {
    return JSON.parse(dados) as string[];
  } catch {
    return [];
  }
}

export async function salvarHistoricoDeletados(
  deletados: string[],
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      HISTORICO_DELETADOS_KEY,
      JSON.stringify(deletados),
    );
  } catch {
    /* Falha silenciosa */
  }
}

export async function listarTreinosPreDefinidos(): Promise<
  TreinoPreDefinido[]
> {
  return treinosPreDefinidos as TreinoPreDefinido[];
}

export async function jaImportouTreino(
  preDefinidoId: string,
): Promise<boolean> {
  const treinos = await carregarTreinos();
  return treinos.some((t) => t.id === preDefinidoId);
}

export async function salvarPerfil(perfil: PerfilUsuario): Promise<void> {
  try {
    await AsyncStorage.setItem(PERFIL_KEY, JSON.stringify(perfil));
  } catch {
    /* Falha silenciosa */
  }
}

export async function carregarPerfil(): Promise<PerfilUsuario | null> {
  const dados = await AsyncStorage.getItem(PERFIL_KEY);
  if (!dados) return null;
  try {
    return JSON.parse(dados) as PerfilUsuario;
  } catch {
    return null;
  }
}

// ── Recordes Pessoais ──

export async function carregarRecordes(): Promise<RecordesMap> {
  const dados = await AsyncStorage.getItem(RECORDES_KEY);
  if (!dados) return {};
  try {
    return JSON.parse(dados);
  } catch {
    return {};
  }
}

export async function salvarRecordes(recordes: RecordesMap): Promise<void> {
  try {
    await AsyncStorage.setItem(RECORDES_KEY, JSON.stringify(recordes));
  } catch {
    /* Falha silenciosa */
  }
}

export async function verificarNovoRecorde(
  exercicioId: string,
  carga: number,
  repeticoes: number,
): Promise<boolean> {
  const recordes = await carregarRecordes();
  const atual = recordes[exercicioId];
  if (!atual || carga > atual.carga) {
    recordes[exercicioId] = {
      carga,
      repeticoes,
      data: new Date().toISOString(),
    };
    await salvarRecordes(recordes);
    return true;
  }
  return false;
}

// ── Medidas Corporais ──

export async function carregarMedidas(): Promise<MedidaCorporal[]> {
  const dados = await AsyncStorage.getItem(MEDIDAS_KEY);
  if (!dados) return [];
  try {
    const medidas: MedidaCorporal[] = JSON.parse(dados);
    return medidas.sort(
      (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime(),
    );
  } catch {
    return [];
  }
}

export async function salvarMedida(medida: MedidaCorporal): Promise<void> {
  const medidas = await carregarMedidas();
  const index = medidas.findIndex((m) => m.id === medida.id);
  if (index >= 0) {
    medidas[index] = medida;
  } else {
    medidas.push(medida);
  }
  try {
    await AsyncStorage.setItem(MEDIDAS_KEY, JSON.stringify(medidas));
  } catch {
    /* Falha silenciosa */
  }
}

export async function deletarMedida(id: string): Promise<void> {
  const medidas = await carregarMedidas();
  const filtradas = medidas.filter((m) => m.id !== id);
  try {
    await AsyncStorage.setItem(MEDIDAS_KEY, JSON.stringify(filtradas));
  } catch {
    /* Falha silenciosa */
  }
}

// ── Água ──

export const CONFIG_AGUA_PADRAO: ConfigAgua = {
  notificacaoAtivada: false,
  intervaloMinutos: 60,
  copoMl: 250,
  metaDiaria: 8,
};

export async function carregarConfigAgua(): Promise<ConfigAgua> {
  const dados = await AsyncStorage.getItem(AGUA_CONFIG_KEY);
  if (!dados) return { ...CONFIG_AGUA_PADRAO };
  try {
    return { ...CONFIG_AGUA_PADRAO, ...JSON.parse(dados) };
  } catch {
    return { ...CONFIG_AGUA_PADRAO };
  }
}

export async function salvarConfigAgua(config: ConfigAgua): Promise<void> {
  try {
    await AsyncStorage.setItem(AGUA_CONFIG_KEY, JSON.stringify(config));
  } catch {
    /* Falha silenciosa */
  }
}

export async function carregarRegistroAgua(): Promise<RegistroAguaDiario[]> {
  const dados = await AsyncStorage.getItem(AGUA_REGISTRO_KEY);
  if (!dados) return [];
  try {
    return JSON.parse(dados);
  } catch {
    return [];
  }
}

export async function salvarRegistroAgua(
  registros: RegistroAguaDiario[],
): Promise<void> {
  try {
    await AsyncStorage.setItem(AGUA_REGISTRO_KEY, JSON.stringify(registros));
  } catch {
    /* Falha silenciosa */
  }
}

export async function adicionarCopoAgua(
  ml: number,
): Promise<RegistroAguaDiario> {
  const registros = await carregarRegistroAgua();
  const hoje = new Date().toISOString().split('T')[0];
  const copo: CopoAgua = { timestamp: new Date().toISOString(), ml };
  let registroHoje = registros.find((r) => r.data === hoje);

  if (registroHoje) {
    registroHoje.copos.push(copo);
  } else {
    registroHoje = { data: hoje, copos: [copo] };
    registros.push(registroHoje);
  }

  await salvarRegistroAgua(registros);
  return registroHoje;
}

// ── Cardio ──

export async function carregarCardio(): Promise<CardioEntry[]> {
  const dados = await AsyncStorage.getItem(CARDIO_KEY);
  if (!dados) return [];
  try {
    return JSON.parse(dados);
  } catch {
    return [];
  }
}

export async function salvarCardio(entries: CardioEntry[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CARDIO_KEY, JSON.stringify(entries));
  } catch {
    /* Falha silenciosa */
  }
}

export async function salvarCardioEntry(entry: CardioEntry): Promise<void> {
  const entries = await carregarCardio();
  entries.push(entry);
  await salvarCardio(entries);
}

export async function deletarCardioEntry(id: string): Promise<void> {
  const entries = await carregarCardio();
  const filtradas = entries.filter((e) => e.id !== id);
  await salvarCardio(filtradas);
}

// ── Exercícios Personalizados ──

const EXERCICIOS_CUSTOM_KEY = '@exerciciosPersonalizados';
const TREINO_EM_ANDAMENTO_KEY = '@treinoEmAndamento';

export async function carregarExerciciosPersonalizados(): Promise<Exercicio[]> {
  const dados = await AsyncStorage.getItem(EXERCICIOS_CUSTOM_KEY);
  if (!dados) return [];
  try {
    return JSON.parse(dados);
  } catch {
    return [];
  }
}

export async function salvarExerciciosPersonalizados(
  exercicios: Exercicio[],
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      EXERCICIOS_CUSTOM_KEY,
      JSON.stringify(exercicios),
    );
  } catch {
    /* Falha silenciosa */
  }
}

export async function salvarExercicioPersonalizado(
  exercicio: Exercicio,
): Promise<void> {
  const lista = await carregarExerciciosPersonalizados();
  const index = lista.findIndex((e) => e.id === exercicio.id);
  if (index >= 0) {
    lista[index] = exercicio;
  } else {
    lista.push(exercicio);
  }
  await salvarExerciciosPersonalizados(lista);
}

export async function deletarExercicioPersonalizado(id: string): Promise<void> {
  const lista = await carregarExerciciosPersonalizados();
  const filtrados = lista.filter((e) => e.id !== id);
  await salvarExerciciosPersonalizados(filtrados);
}

export interface TreinoEmAndamento {
  treinoId: string;
  exerciciosExecucao: ExercicioExecucao[];
  tempoInicio: number;
  ultimaPersistencia: number;
}

export async function salvarTreinoEmAndamento(
  dados: TreinoEmAndamento,
): Promise<void> {
  try {
    await AsyncStorage.setItem(TREINO_EM_ANDAMENTO_KEY, JSON.stringify(dados));
  } catch {
    /* Falha silenciosa */
  }
}

export async function carregarTreinoEmAndamento(): Promise<TreinoEmAndamento | null> {
  const raw = await AsyncStorage.getItem(TREINO_EM_ANDAMENTO_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TreinoEmAndamento;
  } catch {
    return null;
  }
}

export async function limparTreinoEmAndamento(): Promise<void> {
  await AsyncStorage.removeItem(TREINO_EM_ANDAMENTO_KEY);
}

export async function limparStorage(): Promise<void> {
  await AsyncStorage.multiRemove([
    STORAGE_VERSION_KEY,
    TREINOS_KEY,
    HISTORICO_KEY,
    PERFIL_KEY,
    RECORDES_KEY,
    MEDIDAS_KEY,
    AGUA_CONFIG_KEY,
    AGUA_REGISTRO_KEY,
    CARDIO_KEY,
    EXERCICIOS_CUSTOM_KEY,
    TREINO_EM_ANDAMENTO_KEY,
    HISTORICO_DELETADOS_KEY,
  ]);
}
