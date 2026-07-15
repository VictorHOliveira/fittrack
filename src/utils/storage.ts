import AsyncStorage from '@react-native-async-storage/async-storage';
import { Treino, TreinoCompleto, PerfilUsuario, TreinoPreDefinido, RecordesMap, RecordeExercicio, MedidaCorporal, ConfigAgua, RegistroAguaDiario, CopoAgua, CardioEntry, Exercicio } from '../types';
import treinosPreDefinidos from '../data/treinos-pre-definidos.json';

const TREINOS_KEY = '@treinos';
const HISTORICO_KEY = '@historico';
const PERFIL_KEY = '@perfil';
const RECORDES_KEY = '@recordes';
const MEDIDAS_KEY = '@medidas';
const AGUA_CONFIG_KEY = '@configAgua';
const AGUA_REGISTRO_KEY = '@registroAgua';
const CARDIO_KEY = '@cardio';

export async function salvarTreinos(treinos: Treino[]): Promise<void> {
  await AsyncStorage.setItem(TREINOS_KEY, JSON.stringify(treinos));
}

export async function carregarTreinos(): Promise<Treino[]> {
  const dados = await AsyncStorage.getItem(TREINOS_KEY);
  return dados ? JSON.parse(dados) : [];
}

export async function salvarTreino(treino: Treino): Promise<void> {
  const treinos = await carregarTreinos();
  const index = treinos.findIndex(t => t.id === treino.id);
  if (index >= 0) {
    treinos[index] = treino;
  } else {
    treinos.push(treino);
  }
  await salvarTreinos(treinos);
}

export async function deletarTreino(id: string): Promise<void> {
  const treinos = await carregarTreinos();
  const filtrados = treinos.filter(t => t.id !== id);
  await salvarTreinos(filtrados);
}

export async function salvarHistorico(treino: TreinoCompleto): Promise<void> {
  const historico = await carregarHistorico();
  const index = historico.findIndex(h => h.dataExecucao === treino.dataExecucao);
  if (index >= 0) {
    historico[index] = treino;
  } else {
    historico.push(treino);
  }
  await AsyncStorage.setItem(HISTORICO_KEY, JSON.stringify(historico));
}

export async function salvarHistoricos(treinos: TreinoCompleto[]): Promise<void> {
  await AsyncStorage.setItem(HISTORICO_KEY, JSON.stringify(treinos));
}

export async function carregarHistorico(): Promise<TreinoCompleto[]> {
  const dados = await AsyncStorage.getItem(HISTORICO_KEY);
  return dados ? JSON.parse(dados) : [];
}

export function gerarId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function formatarDuracao(segundos: number): string {
  const mins = Math.floor(segundos / 60);
  const secs = segundos % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatarData(data: string): string {
  const d = new Date(data);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export async function listarTreinosPreDefinidos(): Promise<TreinoPreDefinido[]> {
  return treinosPreDefinidos as TreinoPreDefinido[];
}

export async function importarTreinoPreDefinido(preDefinidoId: string): Promise<Treino | null> {
  const treinosExistentes = await carregarTreinos();
  if (treinosExistentes.some(t => t.id === preDefinidoId)) {
    return null;
  }

  const treinoPre = treinosPreDefinidos.find(t => t.id === preDefinidoId);
  if (!treinoPre) return null;

  const todosExercicios = treinoPre.dias.flatMap(d =>
    d.exercicios.map(e => ({
      exercicioId: e.exercicioId,
      series: Array.from({ length: e.series }, (_, i) => ({
        id: gerarId(),
        numero: i + 1,
        cargas: 0,
        repeticoes: parseInt(e.repeticoes) || 12,
        concluida: false,
      })),
      descanso: e.descanso,
    }))
  );

  const novoTreino: Treino = {
    id: treinoPre.id,
    nome: treinoPre.nome,
    descricao: treinoPre.descricao,
    diaSemana: treinoPre.dias[0]?.diaDaSemana ? [treinoPre.dias[0].diaDaSemana] : undefined,
    exercicios: todosExercicios,
    criadoEm: new Date().toISOString(),
  };

  await salvarTreino(novoTreino);
  return novoTreino;
}

export async function jaImportouTreino(preDefinidoId: string): Promise<boolean> {
  const treinos = await carregarTreinos();
  return treinos.some(t => t.id === preDefinidoId);
}

export async function salvarPerfil(perfil: PerfilUsuario): Promise<void> {
  await AsyncStorage.setItem(PERFIL_KEY, JSON.stringify(perfil));
}

export async function carregarPerfil(): Promise<PerfilUsuario | null> {
  const dados = await AsyncStorage.getItem(PERFIL_KEY);
  return dados ? JSON.parse(dados) : null;
}

// ── Recordes Pessoais ──

export async function carregarRecordes(): Promise<RecordesMap> {
  const dados = await AsyncStorage.getItem(RECORDES_KEY);
  return dados ? JSON.parse(dados) : {};
}

export async function salvarRecordes(recordes: RecordesMap): Promise<void> {
  await AsyncStorage.setItem(RECORDES_KEY, JSON.stringify(recordes));
}

export async function verificarNovoRecorde(
  exercicioId: string,
  carga: number,
  repeticoes: number
): Promise<boolean> {
  const recordes = await carregarRecordes();
  const atual = recordes[exercicioId];
  if (!atual || carga > atual.carga) {
    recordes[exercicioId] = {
      carga,
      repeticoes,
      data: new Date().toISOString(),
    };
    await salvarRecordes(recordes);
    return true;
  }
  return false;
}

// ── Medidas Corporais ──

export async function carregarMedidas(): Promise<MedidaCorporal[]> {
  const dados = await AsyncStorage.getItem(MEDIDAS_KEY);
  const medidas: MedidaCorporal[] = dados ? JSON.parse(dados) : [];
  return medidas.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
}

export async function salvarMedida(medida: MedidaCorporal): Promise<void> {
  const medidas = await carregarMedidas();
  const index = medidas.findIndex(m => m.id === medida.id);
  if (index >= 0) {
    medidas[index] = medida;
  } else {
    medidas.push(medida);
  }
  await AsyncStorage.setItem(MEDIDAS_KEY, JSON.stringify(medidas));
}

export async function deletarMedida(id: string): Promise<void> {
  const medidas = await carregarMedidas();
  const filtradas = medidas.filter(m => m.id !== id);
  await AsyncStorage.setItem(MEDIDAS_KEY, JSON.stringify(filtradas));
}

// ── Água ──

export const CONFIG_AGUA_PADRAO: ConfigAgua = {
  notificacaoAtivada: false,
  intervaloMinutos: 60,
  copoMl: 250,
  metaDiaria: 8,
};

export async function carregarConfigAgua(): Promise<ConfigAgua> {
  const dados = await AsyncStorage.getItem(AGUA_CONFIG_KEY);
  return dados ? { ...CONFIG_AGUA_PADRAO, ...JSON.parse(dados) } : { ...CONFIG_AGUA_PADRAO };
}

export async function salvarConfigAgua(config: ConfigAgua): Promise<void> {
  await AsyncStorage.setItem(AGUA_CONFIG_KEY, JSON.stringify(config));
}

export async function carregarRegistroAgua(): Promise<RegistroAguaDiario[]> {
  const dados = await AsyncStorage.getItem(AGUA_REGISTRO_KEY);
  return dados ? JSON.parse(dados) : [];
}

export async function salvarRegistroAgua(registros: RegistroAguaDiario[]): Promise<void> {
  await AsyncStorage.setItem(AGUA_REGISTRO_KEY, JSON.stringify(registros));
}

export async function adicionarCopoAgua(ml: number): Promise<RegistroAguaDiario> {
  const registros = await carregarRegistroAgua();
  const hoje = new Date().toISOString().split('T')[0];
  const copo: CopoAgua = { timestamp: new Date().toISOString(), ml };
  let registroHoje = registros.find(r => r.data === hoje);

  if (registroHoje) {
    registroHoje.copos.push(copo);
  } else {
    registroHoje = { data: hoje, copos: [copo] };
    registros.push(registroHoje);
  }

  await salvarRegistroAgua(registros);
  return registroHoje;
}

// ── Cardio ──

export async function carregarCardio(): Promise<CardioEntry[]> {
  const dados = await AsyncStorage.getItem(CARDIO_KEY);
  return dados ? JSON.parse(dados) : [];
}

export async function salvarCardio(entries: CardioEntry[]): Promise<void> {
  await AsyncStorage.setItem(CARDIO_KEY, JSON.stringify(entries));
}

export async function salvarCardioEntry(entry: CardioEntry): Promise<void> {
  const entries = await carregarCardio();
  entries.push(entry);
  await salvarCardio(entries);
}

export async function deletarCardioEntry(id: string): Promise<void> {
  const entries = await carregarCardio();
  const filtradas = entries.filter(e => e.id !== id);
  await salvarCardio(filtradas);
}

// ── Exercícios Personalizados ──

const EXERCICIOS_CUSTOM_KEY = '@exerciciosPersonalizados';
const TREINO_EM_ANDAMENTO_KEY = '@treinoEmAndamento';

export async function carregarExerciciosPersonalizados(): Promise<Exercicio[]> {
  const dados = await AsyncStorage.getItem(EXERCICIOS_CUSTOM_KEY);
  return dados ? JSON.parse(dados) : [];
}

export async function salvarExerciciosPersonalizados(exercicios: Exercicio[]): Promise<void> {
  await AsyncStorage.setItem(EXERCICIOS_CUSTOM_KEY, JSON.stringify(exercicios));
}

export async function salvarExercicioPersonalizado(exercicio: Exercicio): Promise<void> {
  const lista = await carregarExerciciosPersonalizados();
  const index = lista.findIndex(e => e.id === exercicio.id);
  if (index >= 0) {
    lista[index] = exercicio;
  } else {
    lista.push(exercicio);
  }
  await salvarExerciciosPersonalizados(lista);
}

export async function deletarExercicioPersonalizado(id: string): Promise<void> {
  const lista = await carregarExerciciosPersonalizados();
  const filtrados = lista.filter(e => e.id !== id);
  await salvarExerciciosPersonalizados(filtrados);
}

export interface TreinoEmAndamento {
  treinoId: string;
  exerciciosExecucao: any[];
  tempoInicio: number;
  ultimaPersistencia: number;
}

export async function salvarTreinoEmAndamento(dados: TreinoEmAndamento): Promise<void> {
  await AsyncStorage.setItem(TREINO_EM_ANDAMENTO_KEY, JSON.stringify(dados));
}

export async function carregarTreinoEmAndamento(): Promise<TreinoEmAndamento | null> {
  const raw = await AsyncStorage.getItem(TREINO_EM_ANDAMENTO_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TreinoEmAndamento;
  } catch {
    return null;
  }
}

export async function limparTreinoEmAndamento(): Promise<void> {
  await AsyncStorage.removeItem(TREINO_EM_ANDAMENTO_KEY);
}

export async function limparStorage(): Promise<void> {
  await AsyncStorage.multiRemove([
    TREINOS_KEY, HISTORICO_KEY, PERFIL_KEY, RECORDES_KEY,
    MEDIDAS_KEY, AGUA_CONFIG_KEY, AGUA_REGISTRO_KEY, CARDIO_KEY,
    EXERCICIOS_CUSTOM_KEY, TREINO_EM_ANDAMENTO_KEY,
  ]);
}
