import AsyncStorage from '@react-native-async-storage/async-storage';
import { Exercicio } from '../types';

const EXERCICIOS_CUSTOM_KEY = '@exerciciosPersonalizados';

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
