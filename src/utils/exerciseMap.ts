import exerciciosData from '../data/exercicios.json';
import { Exercicio } from '../types';

const exercicioNomeBase: Record<string, string> = {};
exerciciosData.forEach((e) => {
  exercicioNomeBase[e.id] = e.nome;
});

let customMap: Record<string, string> = {};
let customLoaded = false;

export function setCustomExercises(exercises: Exercicio[]) {
  customMap = {};
  exercises.forEach((e) => {
    customMap[e.id] = e.nome;
  });
  customLoaded = true;
}

export function getExercicioNomeMap(): Record<string, string> {
  if (!customLoaded) return exercicioNomeBase;
  return { ...exercicioNomeBase, ...customMap };
}

export function getExercicioNome(id: string): string {
  return getExercicioNomeMap()[id] || id;
}
