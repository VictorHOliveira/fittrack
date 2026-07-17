import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Vibration,
  BackHandler,
} from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { useTreinos, useHistorico } from '../../../src/hooks/useTreinos';
import { useExercicios } from '../../../src/hooks/useExercicios';
import { ExercicioExecucao } from '../../../src/types';
import {
  formatarDuracao,
  carregarHistorico,
  salvarTreinoEmAndamento,
  carregarTreinoEmAndamento,
  limparTreinoEmAndamento,
} from '../../../src/utils/storage';
import { COR_FUNDO, COR_PRIMARIA } from '../../../src/utils/theme';
import {
  verificarNovoRecordeBatch,
  carregarRecordes,
  salvarRecordes,
} from '../../../src/services/firestoreService';
import TimerTreino from '../../../src/components/treino/TimerTreino';
import ExercicioExecucaoCard from '../../../src/components/treino/ExercicioExecucaoCard';
import DetalhesExercicioModal from '../../../src/components/DetalhesExercicioModal';

const audioSource = require('../../../assets/sounds/descanso.wav');

export default function ExecutarTreinoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { treinos } = useTreinos();
  const { salvar: salvarHistorico } = useHistorico();

  const [treino, setTreino] = useState(
    treinos.find((t) => t.id === id) || null,
  );
  const [exerciciosExecucao, setExerciciosExecucao] = useState<
    ExercicioExecucao[]
  >([]);
  const [tempo, setTempo] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const descansoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [exEditandoDescanso, setExEditandoDescanso] = useState<number | null>(
    null,
  );
  const [valorDescanso, setValorDescanso] = useState('');
  const [exercicioDetalheIndex, setExercicioDetalheIndex] = useState<
    number | null
  >(null);
  const { customLoaded, find } = useExercicios();
  const [historicoAnterior, setHistoricoAnterior] = useState<
    Record<string, { cargas: number; repeticoes: number }[]>
  >({});
  // eslint-disable-next-line react-hooks/purity -- Date.now() is stable for this component's lifetime
  const tempoInicioRef = useRef<number>(Date.now());
  const podeSalvarRef = useRef(true);
  const finalizandoRef = useRef(false);
  const autoSaveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [finalizando, setFinalizando] = useState(false);

  const player = useAudioPlayer(audioSource);

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'mixWithOthers',
    });
    return () => {
      setAudioModeAsync({
        playsInSilentMode: false,
        interruptionMode: 'mixWithOthers',
      });
    };
  }, []);

  useEffect(() => {
    carregarTreinoEmAndamento().then((salvo) => {
      if (salvo && salvo.treinoId === id) {
        tempoInicioRef.current = salvo.tempoInicio;
        setExerciciosExecucao(salvo.exerciciosExecucao);
        setTempo(Math.floor((Date.now() - salvo.tempoInicio) / 1000));
      }
    });
  }, [id]);

  useEffect(() => {
    carregarHistorico().then((historico) => {
      const anteriorMap: Record<
        string,
        { cargas: number; repeticoes: number }[]
      > = {};
      const ordenado = [...historico].sort(
        (a, b) =>
          new Date(b.dataExecucao).getTime() -
          new Date(a.dataExecucao).getTime(),
      );
      for (const h of ordenado) {
        for (const ex of h.exercicios) {
          if (!anteriorMap[ex.exercicioId]) {
            anteriorMap[ex.exercicioId] = ex.series;
          }
        }
      }
      setHistoricoAnterior(anteriorMap);
    });
  }, []);

  useEffect(() => {
    const t = treinos.find((t) => t.id === id);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (t) setTreino(t);
  }, [treinos, id]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTempo((prev) => prev + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    descansoRef.current = setInterval(() => {
      setExerciciosExecucao((prev) => {
        let mudou = false;
        let chegouZero = false;
        const novos = prev.map((ex) => {
          if (ex.descansoRestante > 0) {
            mudou = true;
            if (ex.descansoRestante === 1) chegouZero = true;
            return { ...ex, descansoRestante: ex.descansoRestante - 1 };
          }
          return ex;
        });
        if (chegouZero) {
          Vibration.vibrate(500);
          player.seekTo(0);
          player.play();
        }
        return mudou ? novos : prev;
      });
    }, 1000);
    return () => {
      if (descansoRef.current) clearInterval(descansoRef.current);
    };
  }, [player]);

  useEffect(() => {
    if (treino && customLoaded && exerciciosExecucao.length === 0) {
      const exec = treino.exercicios.map((ex) => {
        const exercicio = find(ex.exercicioId);
        return {
          ...ex,
          nome: exercicio?.nome || 'Exercício',
          musculo: exercicio?.musculo || '',
          icone: exercicio?.icone || 'fitness',
          corGrupo: exercicio?.corGrupo || COR_PRIMARIA,
          descansoRestante: 0,
          anterior: historicoAnterior[ex.exercicioId] || [],
          series: ex.series.map((s) => ({
            ...s,
            cargas: 0,
            repeticoes: 12,
            concluida: false,
          })),
        };
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setExerciciosExecucao(exec);
    }
  }, [treino, customLoaded]);

  useEffect(() => {
    if (
      Object.keys(historicoAnterior).length === 0 ||
      exerciciosExecucao.length === 0
    )
      return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExerciciosExecucao((prev) =>
      prev.map((ex) => ({
        ...ex,
        anterior: historicoAnterior[ex.exercicioId] || ex.anterior || [],
      })),
    );
  }, [historicoAnterior]);

  useEffect(() => {
    if (exerciciosExecucao.length === 0) return;
    const interval = setInterval(() => {
      if (finalizandoRef.current) return;
      salvarTreinoEmAndamento({
        treinoId: id!,
        exerciciosExecucao,
        tempoInicio: tempoInicioRef.current,
        ultimaPersistencia: Date.now(),
      });
    }, 30000);
    autoSaveRef.current = interval;
    return () => clearInterval(interval);
  }, [exerciciosExecucao, id]);

  const persistirEBair = useCallback(() => {
    if (exerciciosExecucao.length > 0 && podeSalvarRef.current) {
      salvarTreinoEmAndamento({
        treinoId: id!,
        exerciciosExecucao,
        tempoInicio: tempoInicioRef.current,
        ultimaPersistencia: Date.now(),
      });
    }
  }, [exerciciosExecucao, id]);

  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => {
            persistirEBair();
            router.back();
          }}
          style={{ marginRight: 8, padding: 4 }}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, persistirEBair, router]);

  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      persistirEBair();
      router.back();
      return true;
    });
    return () => handler.remove();
  }, [persistirEBair]);

  const finalizarTreino = async () => {
    if (!treino || finalizandoRef.current) return;

    const temAlgumaSerieFeita = exerciciosExecucao.some((ex) =>
      ex.series.some((s) => s.concluida && s.cargas > 0),
    );
    if (!temAlgumaSerieFeita) {
      Alert.alert(
        'Treino sem dados',
        'Você não preencheu nenhuma série. Este treino será descartado.',
        [
          { text: 'Voltar ao treino', style: 'cancel' },
          {
            text: 'Descartar',
            style: 'destructive',
            onPress: async () => {
              if (autoSaveRef.current) {
                clearInterval(autoSaveRef.current);
                autoSaveRef.current = null;
              }
              await limparTreinoEmAndamento();
              router.replace('/(tabs)');
            },
          },
        ],
      );
      return;
    }

    finalizandoRef.current = true;
    setFinalizando(true);
    podeSalvarRef.current = false;
    if (autoSaveRef.current) {
      clearInterval(autoSaveRef.current);
      autoSaveRef.current = null;
    }

    const novosRecordes: string[] = [];
    const recordesBatidosDetalhe: Record<string, { cargaAntiga: number; cargaNova: number; repeticoes: number }> = {};
    try {
      const recordes = await carregarRecordes();
      for (const ex of exerciciosExecucao) {
        const seriesCompletas = ex.series.filter(
          (s) => s.concluida && s.cargas > 0,
        );
        if (seriesCompletas.length === 0) continue;

        const cargaMax = seriesCompletas.reduce(
          (max, s) => Math.max(max, s.cargas),
          0,
        );
        const serieMax = seriesCompletas.find((s) => s.cargas === cargaMax);
        const anterior = recordes[ex.exercicioId];
        const isNovoPR = verificarNovoRecordeBatch(
          recordes,
          ex.exercicioId,
          cargaMax,
          serieMax?.repeticoes || 0,
        );
        if (isNovoPR) {
          novosRecordes.push(ex.nome);
          recordesBatidosDetalhe[ex.exercicioId] = {
            cargaAntiga: anterior?.carga || 0,
            cargaNova: cargaMax,
            repeticoes: serieMax?.repeticoes || 0,
          };
        }
      }
      await salvarRecordes(recordes);
    } catch {
      // Falha silenciosa ao verificar recordes
    }

    const dataExecucao = new Date().toISOString();

    Alert.alert(
      'Finalizar Treino',
      novosRecordes.length > 0
        ? `🏆 Novo recorde em: ${novosRecordes.join(', ')}!\n\nDeseja salvar no histórico?`
        : 'Deseja salvar este treino no histórico?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: () => {
            podeSalvarRef.current = true;
            finalizandoRef.current = false;
            setFinalizando(false);
          },
        },
        {
          text: 'Salvar',
          onPress: async () => {
            await limparTreinoEmAndamento();
            await salvarHistorico({
              treino,
              dataExecucao,
              duracao: tempo,
              exercicios: exerciciosExecucao.map((ex) => ({
                exercicioId: ex.exercicioId,
                series: ex.series.map((s) => ({
                  cargas: s.cargas,
                  repeticoes: s.repeticoes,
                })),
              })),
            });
            setTempo(0);
            router.replace({
              pathname: '/resumo-treino',
              params: {
                treinoNome: treino.nome,
                duracao: String(tempo),
                recordesBatidos: JSON.stringify(recordesBatidosDetalhe),
              },
            });
          },
        },
      ],
    );
  };

  const atualizarSerie = (
    exIndex: number,
    serIndex: number,
    campo: 'cargas' | 'repeticoes',
    valor: number | string,
  ) => {
    let parsed: number;
    if (typeof valor === 'string') {
      parsed = parseFloat(valor.replace(',', '.')) || 0;
    } else {
      parsed = valor;
    }
    setExerciciosExecucao((prev) => {
      const novos = [...prev];
      novos[exIndex] = {
        ...novos[exIndex],
        series: novos[exIndex].series.map((s, i: number) =>
          i === serIndex ? { ...s, [campo]: Math.max(0, parsed) } : s,
        ),
      };
      return novos;
    });
  };

  const adicionarSerie = (exIndex: number) => {
    setExerciciosExecucao((prev) => {
      const novos = [...prev];
      const ex = novos[exIndex];
      novos[exIndex] = {
        ...ex,
        series: [...ex.series, { cargas: 0, repeticoes: 12, concluida: false }],
      };
      return novos;
    });
  };

  const removerSerie = (exIndex: number) => {
    setExerciciosExecucao((prev) => {
      const novos = [...prev];
      const ex = novos[exIndex];
      if (ex.series.length <= 1) return prev;
      novos[exIndex] = {
        ...ex,
        series: ex.series.slice(0, -1),
      };
      return novos;
    });
  };

  const marcarConcluida = (exIndex: number, serIndex: number) => {
    setExerciciosExecucao((prev) => {
      const novos = [...prev];
      const ex = novos[exIndex];
      const serie = ex.series[serIndex];
      novos[exIndex] = {
        ...ex,
        descansoRestante: serie.concluida ? 0 : ex.descanso || 60,
        series: ex.series.map((s, i: number) =>
          i === serIndex ? { ...s, concluida: !s.concluida } : s,
        ),
      };
      return novos;
    });
  };

  const abrirEditarDescanso = (exIndex: number) => {
    setExEditandoDescanso(exIndex);
    setValorDescanso(String(exerciciosExecucao[exIndex].descanso || 60));
  };

  const salvarDescanso = () => {
    const novoValor = parseInt(valorDescanso, 10);
    if (exEditandoDescanso === null || isNaN(novoValor) || novoValor < 0)
      return;
    setExerciciosExecucao((prev) => {
      const novos = [...prev];
      novos[exEditandoDescanso] = {
        ...novos[exEditandoDescanso],
        descanso: novoValor,
      };
      return novos;
    });
    setExEditandoDescanso(null);
  };

  if (!treino) {
    return (
      <View style={styles.container}>
        <Text style={styles.textoVazio}>Treino não encontrado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TimerTreino tempo={tempo} formatarDuracao={formatarDuracao} />

      <FlatList
        data={exerciciosExecucao}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={styles.lista}
        renderItem={({ item, index }) => (
          <ExercicioExecucaoCard
            exercicio={item}
            exIndex={index}
            onAtualizarSerie={atualizarSerie}
            onMarcarConcluida={marcarConcluida}
            onAdicionarSerie={adicionarSerie}
            onRemoverSerie={removerSerie}
            onEditarDescanso={abrirEditarDescanso}
            onDetalhe={() => setExercicioDetalheIndex(index)}
            formatarDuracao={formatarDuracao}
          />
        )}
      />

      <TouchableOpacity
        style={[styles.botaoFinalizar, finalizando && { opacity: 0.5 }]}
        onPress={finalizarTreino}
        disabled={finalizando}
      >
        <Ionicons name="stop-circle" size={24} color="#fff" />
        <Text style={styles.botaoFinalizarTexto}>Finalizar Treino</Text>
      </TouchableOpacity>

      <DetalhesExercicioModal
        exercicio={
          exercicioDetalheIndex !== null &&
          exerciciosExecucao[exercicioDetalheIndex]
            ? (find(exerciciosExecucao[exercicioDetalheIndex].exercicioId) ??
              null)
            : null
        }
        visible={exercicioDetalheIndex !== null}
        onClose={() => setExercicioDetalheIndex(null)}
      />

      <Modal
        visible={exEditandoDescanso !== null}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>Tempo de Descanso</Text>
            <View style={styles.modalInputRow}>
              <TextInput
                style={styles.modalInput}
                keyboardType="numeric"
                value={valorDescanso}
                onChangeText={setValorDescanso}
                autoFocus
              />
              <Text style={styles.modalInputLabel}>segundos</Text>
            </View>
            <View style={styles.modalBotoes}>
              <TouchableOpacity
                style={styles.modalBotaoCancelar}
                onPress={() => setExEditandoDescanso(null)}
              >
                <Text style={styles.modalBotaoCancelarTexto}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalBotaoSalvar}
                onPress={salvarDescanso}
              >
                <Text style={styles.modalBotaoSalvarTexto}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COR_FUNDO,
    padding: 20,
  },
  textoVazio: {
    color: '#888',
    textAlign: 'center',
    marginTop: 40,
  },
  lista: {
    gap: 16,
    paddingBottom: 100,
  },
  botaoFinalizar: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#ff6b6b',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  botaoFinalizarTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    borderWidth: 1,
    borderColor: '#333',
  },
  modalTitulo: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 24,
  },
  modalInput: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#6C63FF',
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    width: 100,
    paddingVertical: 10,
  },
  modalInputLabel: {
    color: '#888',
    fontSize: 14,
  },
  modalBotoes: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBotaoCancelar: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#333',
    alignItems: 'center',
  },
  modalBotaoCancelarTexto: {
    color: '#aaa',
    fontSize: 15,
    fontWeight: '600',
  },
  modalBotaoSalvar: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#6C63FF',
    alignItems: 'center',
  },
  modalBotaoSalvarTexto: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
