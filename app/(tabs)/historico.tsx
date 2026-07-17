import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BarChart } from 'react-native-chart-kit';
import { useHistorico } from '../../src/hooks/useTreinos';
import { useRecordes } from '../../src/hooks/useRecordes';
import { useExercicios } from '../../src/hooks/useExercicios';
import {
  calcularResumoPeriodo,
  getSemanaDias,
  calcularEvolucaoExercicio,
  listarExerciciosNoHistorico,
} from '../../src/utils/stats';
import { TreinoCompleto } from '../../src/types';
import { formatarData, formatarDuracao } from '../../src/utils/storage';
import {
  COR_PRIMARIA,
  COR_FUNDO,
  COR_CARD,
  COR_SUCESSO,
  COR_AVISO,
} from '../../src/utils/theme';
import { compartilharRelatorio } from '../../src/utils/export';
import { carregarPerfil } from '../../src/services/firestoreService';

const LARGURA = Dimensions.get('window').width - 40;

const chartConfig = {
  backgroundColor: COR_CARD,
  backgroundGradientFrom: COR_CARD,
  backgroundGradientTo: COR_CARD,
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.7})`,
  style: { borderRadius: 16 },
  propsForBackgroundLines: {
    strokeDasharray: '',
    stroke: 'rgba(255,255,255,0.08)',
  },
};

export default function HistoricoScreen() {
  const router = useRouter();
  const { historico, carregando, deletar } = useHistorico();
  const { recordes } = useRecordes();
  const [exercicioSelecionado, setExercicioSelecionado] = useState<
    string | null
  >(null);
  const [periodo, setPeriodo] = useState<30 | 90>(30);
  const [treinoDetalhe, setTreinoDetalhe] = useState<TreinoCompleto | null>(
    null,
  );
  const { getNome } = useExercicios();

  const resumo = useMemo(
    () => calcularResumoPeriodo(historico, periodo),
    [historico, periodo],
  );
  const diasSemanaAtual = useMemo(() => {
    const semanaDias = getSemanaDias();
    return semanaDias.map((dia) =>
      historico.some((h) => h.dataExecucao.split('T')[0] === dia),
    );
  }, [historico]);
  const exerciciosDisponiveis = useMemo(
    () => listarExerciciosNoHistorico(historico),
    [historico],
  );
  const evolucao = useMemo(
    () =>
      exercicioSelecionado
        ? calcularEvolucaoExercicio(historico, exercicioSelecionado)
        : null,
    [historico, exercicioSelecionado],
  );

  const recordesLista = useMemo(
    () =>
      Object.entries(recordes)
        .map(([exId, rec]) => {
          return {
            exercicioId: exId,
            nome: getNome(exId),
            icone: 'fitness',
            corGrupo: COR_PRIMARIA,
            ...rec,
          };
        })
        .sort((a, b) => b.carga - a.carga),
    [recordes, getNome],
  );

  if (carregando) {
    return (
      <View style={styles.container}>
        <Text style={styles.carregando}>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      removeClippedSubviews
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => router.push('/')}
            style={styles.botaoVoltar}
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.titulo}>Histórico e Estatísticas</Text>
        </View>
        {historico.length > 0 && (
          <TouchableOpacity
            style={styles.botaoCompartilhar}
            onPress={async () => {
              const perfil = await carregarPerfil();
              await compartilharRelatorio(historico, perfil);
            }}
          >
            <Ionicons name="share-outline" size={22} color={COR_PRIMARIA} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.periodoSelector}>
        <TouchableOpacity
          style={[styles.periodoBtn, periodo === 30 && styles.periodoBtnAtivo]}
          onPress={() => setPeriodo(30)}
        >
          <Text
            style={[
              styles.periodoTexto,
              periodo === 30 && styles.periodoTextoAtivo,
            ]}
          >
            30 dias
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.periodoBtn, periodo === 90 && styles.periodoBtnAtivo]}
          onPress={() => setPeriodo(90)}
        >
          <Text
            style={[
              styles.periodoTexto,
              periodo === 90 && styles.periodoTextoAtivo,
            ]}
          >
            90 dias
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.resumoGrid}>
        <View style={styles.resumoCard}>
          <Ionicons name="barbell" size={22} color={COR_PRIMARIA} />
          <Text style={styles.resumoNumero}>{resumo.totalTreinos}</Text>
          <Text style={styles.resumoLabel}>Treinos</Text>
        </View>
        <View style={styles.resumoCard}>
          <Ionicons name="repeat" size={22} color={COR_SUCESSO} />
          <Text style={styles.resumoNumero}>{resumo.totalSeries}</Text>
          <Text style={styles.resumoLabel}>Séries</Text>
        </View>
        <View style={styles.resumoCard}>
          <Ionicons name="fitness" size={22} color={COR_AVISO} />
          <Text style={styles.resumoNumero}>{resumo.totalVolume}</Text>
          <Text style={styles.resumoLabel}>Volume (kg)</Text>
        </View>
        <View style={styles.resumoCard}>
          <Ionicons name="trending-up" size={22} color="#e91e63" />
          <Text style={styles.resumoNumero}>{resumo.cargaMedia}</Text>
          <Text style={styles.resumoLabel}>Carga Média</Text>
        </View>
      </View>

      {recordesLista.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="trophy" size={18} color="#FFD700" />
            <Text style={styles.cardTitulo}>Recordes Pessoais</Text>
          </View>
          {recordesLista.map((rec) => (
            <View key={rec.exercicioId} style={styles.recItem}>
              <View
                style={[
                  styles.recIcone,
                  { backgroundColor: rec.corGrupo + '20' },
                ]}
              >
                <Ionicons
                  name={rec.icone as any}
                  size={18}
                  color={rec.corGrupo}
                />
              </View>
              <View style={styles.recInfo}>
                <Text style={styles.recNome}>{rec.nome}</Text>
                <Text style={styles.recData}>{formatarData(rec.data)}</Text>
              </View>
              <View style={styles.recValorContainer}>
                <Text style={styles.recValor}>{rec.carga}kg</Text>
                <Text style={styles.recReps}>{rec.repeticoes} reps</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitulo}>Frequência Semanal</Text>
        {historico.length > 0 ? (
          <View style={styles.diasRow}>
            {['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'].map((dia, i) => (
              <View key={dia} style={styles.diaCol}>
                <Text style={styles.diaLabel}>{dia}</Text>
                <View
                  style={[
                    styles.diaBox,
                    diasSemanaAtual[i] && styles.diaBoxTreinou,
                  ]}
                >
                  {diasSemanaAtual[i] && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.textoVazio}>Registre treinos para ver dados</Text>
        )}
      </View>

      {exerciciosDisponiveis.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitulo}>Evolução por Exercício</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtros}
          >
            {exerciciosDisponiveis.map((id) => (
              <TouchableOpacity
                key={id}
                style={[
                  styles.filtro,
                  exercicioSelecionado === id && styles.filtroAtivo,
                ]}
                onPress={() =>
                  setExercicioSelecionado(
                    exercicioSelecionado === id ? null : id,
                  )
                }
              >
                <Text
                  style={[
                    styles.filtroTexto,
                    exercicioSelecionado === id && styles.filtroTextoAtivo,
                  ]}
                >
                  {getNome(id)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {evolucao && evolucao.labels.length > 0 ? (
            <View>
              <BarChart
                data={{
                  labels: evolucao.labels.slice(-8),
                  datasets: [
                    {
                      data:
                        evolucao.cargas.slice(-8).length > 0
                          ? evolucao.cargas.slice(-8)
                          : [0],
                    },
                  ],
                }}
                width={LARGURA - 32}
                height={200}
                chartConfig={chartConfig}
                style={styles.chart}
                yAxisSuffix=" kg"
                yAxisLabel=""
                showValuesOnTopOfBars
              />
              <Text style={styles.chartLegenda}>Carga máxima por treino</Text>
            </View>
          ) : (
            <Text style={styles.textoVazio}>
              {exercicioSelecionado
                ? 'Sem dados suficientes para este exercício'
                : 'Selecione um exercício para ver a evolução'}
            </Text>
          )}
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitulo}>Treinos Recentes</Text>
        {historico.length === 0 ? (
          <View style={styles.vazio}>
            <Ionicons name="time-outline" size={48} color="#444" />
            <Text style={styles.textoVazio}>Nenhum treino registrado</Text>
          </View>
        ) : (
          historico.slice(0, 10).map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.historicoItem}
              activeOpacity={0.7}
              onPress={() => setTreinoDetalhe(item)}
            >
              <View style={styles.historicoInfo}>
                <Text style={styles.historicoNome}>{item.treino.nome}</Text>
                <Text style={styles.historicoData}>
                  {formatarData(item.dataExecucao)}
                </Text>
              </View>
              <View style={styles.historicoStats}>
                <Text style={styles.historicoStat}>
                  {formatarDuracao(item.duracao)}
                </Text>
                <Text style={styles.historicoStat}>
                  {item.exercicios.length} ex.
                </Text>
              </View>
              <View style={styles.historicoActions}>
                <TouchableOpacity
                  style={styles.btnExcluir}
                  onPress={(e) => {
                    e.stopPropagation?.();
                    Alert.alert(
                      'Excluir treino',
                      `Deseja excluir "${item.treino.nome}"?\n\nOs recordes pessoais serão recalculados.`,
                      [
                        { text: 'Cancelar', style: 'cancel' },
                        {
                          text: 'Excluir',
                          style: 'destructive',
                          onPress: () => deletar(item.dataExecucao),
                        },
                      ],
                    );
                  }}
                >
                  <Text style={styles.btnExcluirTexto}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      <Modal
        visible={!!treinoDetalhe}
        transparent
        animationType="slide"
        onRequestClose={() => setTreinoDetalhe(null)}
      >
        <View style={styles.histTreinoOverlay}>
          <TouchableOpacity
            style={styles.histTreinoBackdrop}
            activeOpacity={1}
            onPress={() => setTreinoDetalhe(null)}
          />
          <View style={styles.histTreinoModal}>
            <View style={styles.histTreinoHeader}>
              <View style={styles.histTreinoHeaderInfo}>
                <Text style={styles.histTreinoNome}>
                  {treinoDetalhe?.treino.nome}
                </Text>
                <Text style={styles.histTreinoMeta}>
                  {treinoDetalhe
                    ? formatarData(treinoDetalhe.dataExecucao)
                    : ''}{' '}
                  •{' '}
                  {treinoDetalhe ? formatarDuracao(treinoDetalhe.duracao) : ''}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setTreinoDetalhe(null)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.histTreinoBody}>
              {treinoDetalhe?.exercicios.map((ex, ei) => {
                const nomeEx = getNome(ex.exercicioId);
                return (
                  <View key={ei} style={styles.histTreinoEx}>
                    <Text style={styles.histTreinoExNome}>{nomeEx}</Text>
                    <View style={styles.histTreinoExHeader}>
                      <Text style={styles.histTreinoExCol}>Série</Text>
                      <Text style={styles.histTreinoExCol}>Carga</Text>
                      <Text style={styles.histTreinoExCol}>Reps</Text>
                    </View>
                    {ex.series.map((serie, si) => (
                      <View key={si} style={styles.histTreinoExRow}>
                        <Text style={styles.histTreinoExValor}>{si + 1}</Text>
                        <Text style={styles.histTreinoExValor}>
                          {serie.cargas} kg
                        </Text>
                        <Text style={styles.histTreinoExValor}>
                          {serie.repeticoes}
                        </Text>
                      </View>
                    ))}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COR_FUNDO,
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  botaoVoltar: {
    padding: 4,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  botaoCompartilhar: {
    padding: 10,
    backgroundColor: COR_CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  carregando: {
    color: '#888',
    textAlign: 'center',
    marginTop: 40,
  },
  periodoSelector: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  periodoBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COR_CARD,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  periodoBtnAtivo: {
    backgroundColor: COR_PRIMARIA,
    borderColor: COR_PRIMARIA,
  },
  periodoTexto: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
  },
  periodoTextoAtivo: {
    color: '#fff',
  },
  resumoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  resumoCard: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: COR_CARD,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#333',
  },
  resumoNumero: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  resumoLabel: {
    fontSize: 12,
    color: '#888',
  },
  card: {
    backgroundColor: COR_CARD,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  recItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4a',
  },
  recIcone: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recInfo: {
    flex: 1,
  },
  recNome: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  recData: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  recValorContainer: {
    alignItems: 'flex-end',
  },
  recValor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  recReps: {
    fontSize: 11,
    color: '#888',
  },
  diasRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  diaCol: {
    alignItems: 'center',
    gap: 4,
  },
  diaLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
  },
  diaBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  diaBoxTreinou: {
    backgroundColor: COR_SUCESSO,
    borderColor: COR_SUCESSO,
  },
  chart: {
    borderRadius: 16,
    marginVertical: 8,
  },
  chartLegenda: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 4,
  },
  filtros: {
    gap: 8,
    marginBottom: 12,
  },
  filtro: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#2a2a4a',
    borderWidth: 1,
    borderColor: '#333',
  },
  filtroAtivo: {
    backgroundColor: COR_PRIMARIA,
    borderColor: COR_PRIMARIA,
  },
  filtroTexto: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
  },
  filtroTextoAtivo: {
    color: '#fff',
  },
  textoVazio: {
    color: '#666',
    textAlign: 'center',
    paddingVertical: 20,
    fontSize: 14,
  },
  vazio: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  historicoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  historicoInfo: {
    flex: 1,
  },
  historicoNome: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  historicoData: {
    fontSize: 12,
    color: '#888',
  },
  historicoStats: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  historicoStat: {
    fontSize: 13,
    color: '#aaa',
  },
  histTreinoOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  histTreinoBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  histTreinoModal: {
    backgroundColor: COR_FUNDO,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  histTreinoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 20,
    marginBottom: 20,
  },
  histTreinoHeaderInfo: {
    flex: 1,
    marginRight: 16,
  },
  histTreinoNome: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  histTreinoMeta: {
    fontSize: 13,
    color: '#888',
  },
  histTreinoBody: {
    paddingBottom: 20,
  },
  histTreinoEx: {
    marginBottom: 20,
    backgroundColor: COR_CARD,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#333',
  },
  histTreinoExNome: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  histTreinoExHeader: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  histTreinoExCol: {
    flex: 1,
    fontSize: 11,
    color: '#666',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  histTreinoExRow: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  historicoActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 8,
  },
  btnExcluir: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  btnExcluirTexto: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
  },
  histTreinoExValor: {
    flex: 1,
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
  },
});
