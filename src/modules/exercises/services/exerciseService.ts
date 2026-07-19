import { Exercicio } from '../types';
import {
  carregarExerciciosPersonalizados as loadExerciciosCustomLocal,
  salvarExerciciosPersonalizados as saveExerciciosCustomLocal,
} from './exerciseStorage';

export const carregarExerciciosPersonalizadosLocal = loadExerciciosCustomLocal;

export async function carregarExerciciosPersonalizados(): Promise<Exercicio[]> {
  try {
    const { getDb, getAuth, USERS_COLLECTION } = await import('../../../lib/firebase');
    const uid = getAuth().currentUser?.uid;
    if (!uid) throw new Error('Usuário não autenticado');
    
    const doc = await getDb().collection(USERS_COLLECTION).doc(uid).get();
    const dados = doc.data()?.customExercises as Exercicio[] | undefined;
    if (dados && dados.length > 0) {
      await saveExerciciosCustomLocal(dados);
      return dados;
    }
    const locais = await loadExerciciosCustomLocal();
    if (locais.length > 0) {
      await getDb().collection(USERS_COLLECTION).doc(uid).set({ customExercises: locais }, { merge: true });
      return locais;
    }
    return [];
  } catch {
    return loadExerciciosCustomLocal();
  }
}

export async function salvarExerciciosPersonalizados(
  exercicios: Exercicio[],
): Promise<void> {
  await saveExerciciosCustomLocal(exercicios);
  try {
    const { getDb, getAuth, USERS_COLLECTION } = await import('../../../lib/firebase');
    const uid = getAuth().currentUser?.uid;
    if (!uid) throw new Error('Usuário não autenticado');
    
    await getDb().collection(USERS_COLLECTION).doc(uid).set({ customExercises: exercicios }, { merge: true });
  } catch {
    // Falha silenciosa — dados já salvos localmente
  }
}
