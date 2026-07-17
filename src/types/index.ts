export interface Exercicio {
  id: string;
  nome: string;
  musculo: string;
  icone: string;
  corGrupo: string;
  descricao: string;
  equipamento?: string;
  personalizado?: boolean;
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

export interface Treino {
  id: string;
  nome: string;
  descricao: string;
  diaSemana?: string[];
  exercicios: ExercicioTreino[];
  criadoEm: string;
}

export interface TreinoCompleto {
  treino: Treino;
  dataExecucao: string;
  duracao: number;
  exercicios: {
    exercicioId: string;
    series: {
      cargas: number;
      repeticoes: number;
    }[];
  }[];
}

export interface SeriePreDefinida {
  exercicioId: string;
  series: number;
  repeticoes: string;
  descanso: number;
}

export interface DiaTreino {
  nome: string;
  diaDaSemana: string;
  exercicios: SeriePreDefinida[];
}

export interface TreinoPreDefinido {
  id: string;
  nome: string;
  descricao: string;
  nivel: 'iniciante' | 'intermediario' | 'avancado';
  frequenciaSemanal: number;
  duracaoEstimada: number;
  dias: DiaTreino[];
}

export interface PerfilUsuario {
  nome: string;
  idade: string;
  altura: string;
  nivel: 'iniciante' | 'intermediario' | 'avancado';
  objetivo: string[];
  diasPorSemana: string;
  fotoUri?: string;
}

export interface RecordeExercicio {
  carga: number;
  repeticoes: number;
  data: string;
}

export type RecordesMap = { [exercicioId: string]: RecordeExercicio };

export interface MedidaCorporal {
  id: string;
  data: string;
  peso: string;
  cintura: string;
  braco?: string;
  bracoEsq?: string;
  bracoDir?: string;
  coxa?: string;
  coxaEsq?: string;
  coxaDir?: string;
  peito: string;
  gorduraCorporal?: string;
}

export interface ConfigAgua {
  notificacaoAtivada: boolean;
  intervaloMinutos: number;
  copoMl: number;
  metaDiaria: number;
}

export interface CopoAgua {
  timestamp: string;
  ml: number;
}

export interface RegistroAguaDiario {
  data: string;
  copos: CopoAgua[];
}

export type TipoCardio =
  | 'bicicleta'
  | 'caminhada'
  | 'corrida'
  | 'natacao'
  | 'pular_corda'
  | 'eliptico'
  | 'bike_ergometrica'
  | 'outro';

export interface CardioEntry {
  id: string;
  data: string;
  tipo: TipoCardio;
  tipoOutro?: string;
  duracaoMinutos: number;
  calorias: number;
  distanciaKm?: number;
  observacao?: string;
  timestamp: string;
}

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
  descanso: number;
  descansoRestante: number;
  anterior: { cargas: number; repeticoes: number }[];
  series: ExercicioExecucaoSerie[];
}

export type RootStackParamList = {
  index: undefined;
  treinos: undefined;
  historico: undefined;
  perfil: undefined;
  'treino/[id]': { id: string };
  'criar-treino': undefined;
  'criar-treino/[id]': { id: string };
  exercicios: undefined;
  'treino-predefinido': { id: string };
  'medidas/index': undefined;
};
