export interface Exercicio {
  id: string;
  nome: string;
  musculo: string;
  icone: string;
  corGrupo: string;
  descricao: string;
  equipamento?: string;
  personalizado?: boolean;
  imageUrl?: string;
}

export interface Serie {
  id: string;
  numero: number;
  cargas: number;
  repeticoes: number;
  concluida: boolean;
}

export interface ExercicioTreino {
  exercicioId: string;
  series: Serie[];
  descanso: number;
}

export interface SeriePreDefinida {
  exercicioId: string;
  series: number;
  repeticoes: string;
  descanso: number;
}

export interface RecordeExercicio {
  carga: number;
  repeticoes: number;
  data: string;
}

export type RecordesMap = { [exercicioId: string]: RecordeExercicio };

export interface ExercicioExecucaoSerie {
  cargas: number;
  repeticoes: number;
  concluida: boolean;
}

export interface ExercicioExecucao {
  exercicioId: string;
  nome: string;
  musculo: string;
  icone: string;
  corGrupo: string;
  imageUrl?: string;
  descanso: number;
  descansoRestante: number;
  anterior: { cargas: number; repeticoes: number }[];
  series: ExercicioExecucaoSerie[];
}
