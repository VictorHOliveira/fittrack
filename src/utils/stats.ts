import { TreinoCompleto } from '../types';
import exerciciosData from '../data/exercicios.json';

export function inicioDaSemana(): string {
  const hoje = new Date();
  const dia = hoje.getDay();
  const diff = dia === 0 ? -6 : 1 - dia;
  const segunda = new Date(hoje);
  segunda.setDate(hoje.getDate() + diff);
  return segunda.toISOString().split('T')[0];
}

export function getSemanaDias(): string[] {
  const inicio = inicioDaSemana();
  const dias: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(inicio);
    d.setDate(d.getDate() + i);
    dias.push(d.toISOString().split('T')[0]);
  }
  return dias;
}

export interface DadosEvolucao {
  labels: string[];
  cargas: number[];
  volume: number[];
}

export interface DadosFrequencia {
  labels: string[];
  treinos: number[];
}

export interface ResumoPeriodo {
  totalTreinos: number;
  totalSeries: number;
  totalVolume: number;
  cargaMedia: number;
  treinosPorSemana: number;
}

export function calcularEvolucaoExercicio(
  historico: TreinoCompleto[],
  exercicioId: string,
): DadosEvolucao {
  const dados: { data: string; cargaMax: number; volume: number }[] = [];

  for (const treino of historico) {
    const exercicio = treino.exercicios.find(
      (e) => e.exercicioId === exercicioId,
    );
    if (!exercicio) continue;

    const cargaMax = exercicio.series.reduce(
      (max, s) => Math.max(max, s.cargas),
      0,
    );
    const volume = exercicio.series.reduce(
      (acc, s) => acc + s.cargas * s.repeticoes,
      0,
    );
    const data = new Date(treino.dataExecucao).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });

    dados.push({ data, cargaMax, volume });
  }

  return {
    labels: dados.map((d) => d.data),
    cargas: dados.map((d) => d.cargaMax),
    volume: dados.map((d) => d.volume),
  };
}

export function calcularFrequenciaSemanal(
  historico: TreinoCompleto[],
): DadosFrequencia {
  const semanaAtual = new Date();
  const labels: string[] = [];
  const treinos: number[] = [];

  for (let i = 7; i >= 0; i--) {
    const data = new Date(semanaAtual);
    data.setDate(data.getDate() - i * 7);

    const inicioSemana = new Date(data);
    inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
    const fimSemana = new Date(inicioSemana);
    fimSemana.setDate(fimSemana.getDate() + 6);

    const treinosNaSemana = historico.filter((t) => {
      const dataTreino = new Date(t.dataExecucao);
      return dataTreino >= inicioSemana && dataTreino <= fimSemana;
    }).length;

    labels.push(
      inicioSemana.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      }),
    );
    treinos.push(treinosNaSemana);
  }

  return { labels, treinos };
}

export function calcularResumoPeriodo(
  historico: TreinoCompleto[],
  dias: number = 30,
): ResumoPeriodo {
  const dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() - dias);

  const historicoFiltrado = historico.filter(
    (t) => new Date(t.dataExecucao) >= dataLimite,
  );

  const totalTreinos = historicoFiltrado.length;
  const totalSeries = historicoFiltrado.reduce(
    (acc, t) => acc + t.exercicios.reduce((a, e) => a + e.series.length, 0),
    0,
  );
  const totalVolume = historicoFiltrado.reduce(
    (acc, t) =>
      acc +
      t.exercicios.reduce(
        (a, e) =>
          a +
          e.series.reduce((s, serie) => s + serie.cargas * serie.repeticoes, 0),
        0,
      ),
    0,
  );

  const cargas = historicoFiltrado.flatMap((t) =>
    t.exercicios
      .flatMap((e) => e.series.map((s) => s.cargas))
      .filter((c) => c > 0),
  );
  const cargaMedia =
    cargas.length > 0 ? cargas.reduce((a, b) => a + b, 0) / cargas.length : 0;

  const treinosPorSemana = totalTreinos / (dias / 7);

  return {
    totalTreinos,
    totalSeries,
    totalVolume: Math.round(totalVolume),
    cargaMedia: Math.round(cargaMedia * 10) / 10,
    treinosPorSemana: Math.round(treinosPorSemana * 10) / 10,
  };
}

export function getExercicioNome(
  exercicioId: string,
  customMap?: Record<string, string>,
): string {
  if (customMap?.[exercicioId]) return customMap[exercicioId];
  return exerciciosData.find((e) => e.id === exercicioId)?.nome || exercicioId;
}

export function getExercicioMusculo(
  exercicioId: string,
  customMap?: Record<string, string>,
): string {
  if (customMap?.[exercicioId]) return '';
  return exerciciosData.find((e) => e.id === exercicioId)?.musculo || '';
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

export function calcularVolumeTreino(treino: TreinoCompleto): number {
  return calcularVolumeExercicio(treino.exercicios);
}

export function calcularSeriesExercicio(
  exercicios: { series: unknown[] }[],
): number {
  return exercicios.reduce((acc, ex) => acc + ex.series.length, 0);
}

export function listarExerciciosNoHistorico(
  historico: TreinoCompleto[],
): string[] {
  const ids = new Set<string>();
  for (const treino of historico) {
    for (const ex of treino.exercicios) {
      ids.add(ex.exercicioId);
    }
  }
  return Array.from(ids);
}
