import { getDb, USERS_COLLECTION } from '../lib/firebase';
import {
  carregarTreinos,
  carregarHistorico,
  carregarPerfil,
  carregarRecordes,
  carregarMedidas,
  carregarConfigAgua,
  carregarRegistroAgua,
  carregarCardio,
} from '../utils/storage';

function userRef(uid: string) {
  return getDb().collection(USERS_COLLECTION).doc(uid);
}

export async function syncPerfil(uid: string): Promise<void> {
  const perfil = await carregarPerfil();
  if (perfil) {
    await userRef(uid).set({ profile: perfil }, { merge: true });
  }
}

export async function syncTreinos(uid: string): Promise<void> {
  const treinos = await carregarTreinos();
  if (treinos.length === 0) return;
  const batch = getDb().batch();
  for (const t of treinos) {
    batch.set(userRef(uid).collection('treinos').doc(t.id), t);
  }
  await batch.commit();
}

export async function syncHistorico(uid: string): Promise<void> {
  const historico = await carregarHistorico();
  if (historico.length === 0) return;
  const batch = getDb().batch();
  for (const h of historico) {
    batch.set(userRef(uid).collection('historico').doc(h.dataExecucao), h);
  }
  await batch.commit();
}

export async function syncRecordes(uid: string): Promise<void> {
  const recordes = await carregarRecordes();
  if (Object.keys(recordes).length === 0) return;
  const batch = getDb().batch();
  for (const [exercicioId, recorde] of Object.entries(recordes)) {
    batch.set(userRef(uid).collection('recordes').doc(exercicioId), recorde);
  }
  await batch.commit();
}

export async function syncMedidas(uid: string): Promise<void> {
  const medidas = await carregarMedidas();
  if (medidas.length === 0) return;
  const batch = getDb().batch();
  for (const m of medidas) {
    batch.set(userRef(uid).collection('medidas').doc(m.id), m);
  }
  await batch.commit();
}

export async function syncAguaConfig(uid: string): Promise<void> {
  const config = await carregarConfigAgua();
  await userRef(uid).set({ aguaConfig: config }, { merge: true });
}

export async function syncAguaRegistros(uid: string): Promise<void> {
  const registros = await carregarRegistroAgua();
  if (registros.length === 0) return;
  const batch = getDb().batch();
  for (const r of registros) {
    batch.set(userRef(uid).collection('aguaRegistros').doc(r.data), r);
  }
  await batch.commit();
}

export async function syncCardio(uid: string): Promise<void> {
  const entries = await carregarCardio();
  if (entries.length === 0) return;
  const batch = getDb().batch();
  for (const e of entries) {
    batch.set(userRef(uid).collection('cardio').doc(e.id), e);
  }
  await batch.commit();
}

export async function migrarDadosParaFirestore(uid: string): Promise<void> {
  await Promise.all([
    syncPerfil(uid),
    syncTreinos(uid),
    syncHistorico(uid),
    syncRecordes(uid),
    syncMedidas(uid),
    syncAguaConfig(uid),
    syncAguaRegistros(uid),
    syncCardio(uid),
  ]);
}

export async function checkAndMigrate(uid: string): Promise<void> {
  const doc = await userRef(uid).get();
  if (!doc.exists) {
    await userRef(uid).set({ createdAt: new Date().toISOString() });
    await migrarDadosParaFirestore(uid);
  } else {
    const data = doc.data();
    if (data && !data.migrated) {
      await migrarDadosParaFirestore(uid);
      await userRef(uid).set({ migrated: true }, { merge: true });
    }
  }
}
