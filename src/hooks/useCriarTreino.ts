import { Treino, ExercicioTreino, Serie, TreinoPreDefinido } from '../types';
import { gerarId } from '../utils/storage';

export function criarSerie(numero: number, repeticoes = 12): Serie {
  return {
    id: gerarId(),
    numero,
    cargas: 0,
    repeticoes,
    concluida: false,
  };
}

export function criarExercicioTreino(
  exercicioId: string,
  numSeries = 3,
  repeticoes = 12,
  descanso = 60,
): ExercicioTreino {
  return {
    exercicioId,
    series: Array.from({ length: numSeries }, (_, i) =>
      criarSerie(i + 1, repeticoes),
    ),
    descanso,
  };
}

export function construirTreino(params: {
  id?: string;
  nome: string;
  descricao?: string;
  diaSemana?: string[];
  exercicios: ExercicioTreino[];
}): Treino {
  return {
    id: params.id || gerarId(),
    nome: params.nome.trim(),
    descricao: (params.descricao || '').trim(),
    diaSemana: params.diaSemana,
    exercicios: params.exercicios,
    criadoEm: new Date().toISOString(),
  };
}

export function importarPreDefinido(pre: TreinoPreDefinido): Treino {
  const exercicios: ExercicioTreino[] = pre.dias.flatMap((d) =>
    d.exercicios.map((e) =>
      criarExercicioTreino(
        e.exercicioId,
        e.series,
        parseInt(e.repeticoes) || 12,
        e.descanso,
      ),
    ),
  );

  return construirTreino({
    id: pre.id,
    nome: pre.nome,
    descricao: pre.descricao,
    diaSemana: pre.dias[0]?.diaDaSemana ? [pre.dias[0].diaDaSemana] : undefined,
    exercicios,
  });
}
