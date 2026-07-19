export function getExercicioNome(
  exercicioId: string,
  customMap?: Record<string, string>,
): string {
  if (customMap?.[exercicioId]) return customMap[exercicioId];
  const { exercicios } = require('../data');
  return (
    exercicios.find((e: { id: string }) => e.id === exercicioId)?.nome ||
    exercicioId
  );
}

export function getExercicioMusculo(
  exercicioId: string,
  customMap?: Record<string, string>,
): string {
  if (customMap?.[exercicioId]) return '';
  const { exercicios } = require('../data');
  return (
    exercicios.find((e: { id: string }) => e.id === exercicioId)?.musculo || ''
  );
}

export function calcularVolumeExercicio(
  exercicios: { series: { cargas: number; repeticoes: number }[] }[],
): number {
  return exercicios.reduce(
    (acc, ex) =>
      acc +
      ex.series.reduce((s, serie) => s + serie.cargas * serie.repeticoes, 0),
    0,
  );
}

export function calcularSeriesExercicio(
  exercicios: { series: unknown[] }[],
): number {
  return exercicios.reduce((acc, ex) => acc + ex.series.length, 0);
}

export function listarExerciciosNoHistorico(
  historico: { exercicios: { exercicioId: string }[] }[],
): string[] {
  const ids = new Set<string>();
  for (const treino of historico) {
    for (const ex of treino.exercicios) {
      ids.add(ex.exercicioId);
    }
  }
  return Array.from(ids);
}
