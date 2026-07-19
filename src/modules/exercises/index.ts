// Types
export type {
  Exercicio,
  Serie,
  ExercicioTreino,
  SeriePreDefinida,
  RecordeExercicio,
  RecordesMap,
  ExercicioExecucaoSerie,
  ExercicioExecucao,
} from './types';

// Data
export { exercicios } from './data';

// Services
export {
  carregarExerciciosPersonalizados,
  salvarExerciciosPersonalizados,
  carregarExerciciosPersonalizadosLocal,
} from './services/exerciseService';

export {
  carregarExerciciosPersonalizados as carregarExerciciosPersonalizadosStorage,
  salvarExerciciosPersonalizados as salvarExerciciosPersonalizadosStorage,
  salvarExercicioPersonalizado,
  deletarExercicioPersonalizado,
} from './services/exerciseStorage';

// Hooks
export { useExercicios, resetExerciciosSync } from './hooks/useExercicios';
export { useRecordes } from './hooks/useRecordes';

// Utils
export {
  getExercicioNome,
  getExercicioMusculo,
  calcularVolumeExercicio,
  calcularSeriesExercicio,
  listarExerciciosNoHistorico,
} from './utils/exerciseStats';

export {
  setCustomExercises,
  getExercicioNomeMap,
  getExercicioNome as getExercicioNomeFromMap,
} from './utils/exerciseMap';

// Components
export { default as ListaExercicios } from './components/ListaExercicios';
export { default as DetalhesExercicioModal } from './components/DetalhesExercicioModal';
export { default as ExercicioGif } from './components/ExercicioGif';
