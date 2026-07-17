import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Dimensions,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { MedidaCorporal } from '../../src/types';
import {
  carregarMedidas,
  salvarMedida,
  deletarMedida,
} from '../../src/services/firestoreService';
import { gerarId, formatarData } from '../../src/utils/storage';
import {
  COR_PRIMARIA,
  COR_FUNDO,
  COR_CARD,
  COR_SUCESSO,
} from '../../src/utils/theme';

const LARGURA = Dimensions.get('window').width - 40;

type MetricaChave =
  | 'peso'
  | 'cintura'
  | 'bracoEsq'
  | 'bracoDir'
  | 'coxaEsq'
  | 'coxaDir'
  | 'peito'
  | 'gorduraCorporal';

const METRICAS: {
  chave: MetricaChave;
  label: string;
  unidade: string;
  cor: string;
}[] = [
  { chave: 'peso', label: 'Peso', unidade: 'kg', cor: '#6C63FF' },
  { chave: 'cintura', label: 'Cintura', unidade: 'cm', cor: '#4CAF50' },
  { chave: 'bracoEsq', label: 'Braço Esq', unidade: 'cm', cor: '#ff9800' },
  { chave: 'bracoDir', label: 'Braço Dir', unidade: 'cm', cor: '#e65100' },
  { chave: 'coxaEsq', label: 'Coxa Esq', unidade: 'cm', cor: '#e91e63' },
  { chave: 'coxaDir', label: 'Coxa Dir', unidade: 'cm', cor: '#880e4f' },
  { chave: 'peito', label: 'Peitoral', unidade: 'cm', cor: '#2196f3' },
  {
    chave: 'gorduraCorporal',
    label: 'Gordura Corp.',
    unidade: '%',
    cor: '#9C27B0',
  },
];

const chartConfig = {
  backgroundColor: COR_CARD,
  backgroundGradientFrom: COR_CARD,
  backgroundGradientTo: COR_CARD,
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.7})`,
  style: { borderRadius: 16 },
  propsForDots: { r: '5', strokeWidth: '2', stroke: COR_PRIMARIA },
  propsForBackgroundLines: {
    strokeDasharray: '',
    stroke: 'rgba(255,255,255,0.08)',
  },
};

export default function MedidasScreen() {
  const [medidas, setMedidas] = useState<MedidaCorporal[]>([]);
  const [metricaSelecionada, setMetricaSelecionada] =
    useState<MetricaChave>('peso');
  const [editando, setEditando] = useState(false);

  const [medidaDetalhe, setMedidaDetalhe] = useState<MedidaCorporal | null>(
    null,
  );
  const [peso, setPeso] = useState('');
  const [cintura, setCintura] = useState('');
  const [bracoEsq, setBracoEsq] = useState('');
  const [bracoDir, setBracoDir] = useState('');
  const [coxaEsq, setCoxaEsq] = useState('');
  const [coxaDir, setCoxaDir] = useState('');
  const [peito, setPeito] = useState('');
  const [gorduraCorporal, setGorduraCorporal] = useState('');

  const carregar = async () => {
    const dados = await carregarMedidas();
    setMedidas(dados);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregar();
  }, []);

  const handleSalvar = async () => {
    if (
      !peso.trim() &&
      !cintura.trim() &&
      !bracoEsq.trim() &&
      !bracoDir.trim() &&
      !coxaEsq.trim() &&
      !coxaDir.trim() &&
      !peito.trim() &&
      !gorduraCorporal.trim()
    ) {
      Alert.alert('Erro', 'Preencha pelo menos uma medida');
      return;
    }

    const novaMedida: MedidaCorporal = {
      id: gerarId(),
      data: new Date().toISOString(),
      peso: peso.trim(),
      cintura: cintura.trim(),
      bracoEsq: bracoEsq.trim() || undefined,
      bracoDir: bracoDir.trim() || undefined,
      coxaEsq: coxaEsq.trim() || undefined,
      coxaDir: coxaDir.trim() || undefined,
      peito: peito.trim(),
      gorduraCorporal: gorduraCorporal.trim() || undefined,
    };

    await salvarMedida(novaMedida);
    setPeso('');
    setCintura('');
    setBracoEsq('');
    setBracoDir('');
    setCoxaEsq('');
    setCoxaDir('');
    setPeito('');
    setGorduraCorporal('');
    setEditando(false);
    await carregar();
  };

  const handleDeletar = async (id: string) => {
    Alert.alert('Deletar', 'Remover esta medição?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Deletar',
        style: 'destructive',
        onPress: async () => {
          await deletarMedida(id);
          await carregar();
        },
      },
    ]);
  };

  const metricaInfo = METRICAS.find((m) => m.chave === metricaSelecionada)!;
  const dadosGrafico = medidas.filter((m) => m[metricaSelecionada]).reverse();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scroll}
      removeClippedSubviews
    >
      <View style={styles.header}>
        <Text style={styles.titulo}>Medidas Corporais</Text>
        <TouchableOpacity
          style={styles.botaoAdd}
          onPress={() => setEditando(!editando)}
        >
          <Ionicons name={editando ? 'close' : 'add'} size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {editando && (
        <View style={styles.formCard}>
          <Text style={styles.formTitulo}>Nova Medição</Text>

          {METRICAS.map((m) => {
            const [value, setValue] = (() => {
              switch (m.chave) {
                case 'peso':
                  return [peso, setPeso] as const;
                case 'cintura':
                  return [cintura, setCintura] as const;
                case 'bracoEsq':
                  return [bracoEsq, setBracoEsq] as const;
                case 'bracoDir':
                  return [bracoDir, setBracoDir] as const;
                case 'coxaEsq':
                  return [coxaEsq, setCoxaEsq] as const;
                case 'coxaDir':
                  return [coxaDir, setCoxaDir] as const;
                case 'peito':
                  return [peito, setPeito] as const;
                case 'gorduraCorporal':
                  return [gorduraCorporal, setGorduraCorporal] as const;
              }
            })();

            return (
              <View key={m.chave} style={styles.inputRow}>
                <Text style={styles.inputLabel}>
                  {m.label} ({m.unidade})
                </Text>
                <TextInput
                  style={styles.input}
                  value={value}
                  onChangeText={setValue}
                  placeholder={`${m.label}...`}
                  placeholderTextColor="#555"
                  keyboardType="numeric"
                />
              </View>
            );
          })}

          <TouchableOpacity style={styles.botaoSalvar} onPress={handleSalvar}>
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.botaoSalvarTexto}>Salvar</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.seletorLinha}>
        {METRICAS.filter(
          (m) =>
            m.chave === 'peso' ||
            m.chave === 'cintura' ||
            m.chave === 'peito' ||
            m.chave === 'gorduraCorporal',
        ).map((m) => (
          <TouchableOpacity
            key={m.chave}
            style={[
              styles.metricaBtn,
              metricaSelecionada === m.chave && { backgroundColor: m.cor },
            ]}
            onPress={() => setMetricaSelecionada(m.chave)}
          >
            <Text
              style={[
                styles.metricaTexto,
                metricaSelecionada === m.chave && { color: '#fff' },
              ]}
            >
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.seletorLinha}>
        {METRICAS.filter(
          (m) =>
            m.chave === 'bracoEsq' ||
            m.chave === 'bracoDir' ||
            m.chave === 'coxaEsq' ||
            m.chave === 'coxaDir',
        ).map((m) => (
          <TouchableOpacity
            key={m.chave}
            style={[
              styles.metricaBtn,
              metricaSelecionada === m.chave && { backgroundColor: m.cor },
            ]}
            onPress={() => setMetricaSelecionada(m.chave)}
          >
            <Text
              style={[
                styles.metricaTexto,
                metricaSelecionada === m.chave && { color: '#fff' },
              ]}
            >
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {dadosGrafico.length >= 2 ? (
        <View style={styles.card}>
          <Text style={styles.cardTitulo}>
            {metricaInfo.label} ao Longo do Tempo
          </Text>
          <LineChart
            data={{
              labels: dadosGrafico.map((d) => formatarData(d.data)),
              datasets: [
                {
                  data: dadosGrafico.map(
                    (d) => parseFloat(d[metricaSelecionada] as string) || 0,
                  ),
                },
              ],
            }}
            width={LARGURA - 32}
            height={200}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => {
                const r = parseInt(metricaInfo.cor.slice(1, 3), 16);
                const g = parseInt(metricaInfo.cor.slice(3, 5), 16);
                const b = parseInt(metricaInfo.cor.slice(5, 7), 16);
                return `rgba(${r},${g},${b},${opacity})`;
              },
            }}
            style={styles.chart}
            yAxisSuffix={` ${metricaInfo.unidade}`}
            yAxisLabel=""
            bezier
          />
        </View>
      ) : dadosGrafico.length === 1 ? (
        <View style={styles.card}>
          <Text style={styles.cardTitulo}>Último Registro</Text>
          <View style={styles.ultimoRegistro}>
            <Text style={styles.ultimoValor}>
              {dadosGrafico[0][metricaSelecionada]} {metricaInfo.unidade}
            </Text>
            <Text style={styles.ultimoData}>
              {formatarData(dadosGrafico[0].data)}
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.textoVazio}>
            Registre ao menos 2 medições para ver o gráfico
          </Text>
        </View>
      )}

      {medidas.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitulo}>Histórico</Text>
          {medidas.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={styles.histItem}
              activeOpacity={0.7}
              onPress={() => setMedidaDetalhe(m)}
            >
              <Text style={styles.histItemData}>{formatarData(m.data)}</Text>
              <View style={styles.histItemRight}>
                <Ionicons name="chevron-forward" size={18} color="#444" />
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    handleDeletar(m.id);
                  }}
                  style={styles.botaoDeletar}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="trash-outline" size={18} color="#ff6b6b" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <Modal
        visible={!!medidaDetalhe}
        transparent
        animationType="slide"
        onRequestClose={() => setMedidaDetalhe(null)}
      >
        <View style={styles.histModalOverlay}>
          <TouchableOpacity
            style={styles.histModalBackdrop}
            activeOpacity={1}
            onPress={() => setMedidaDetalhe(null)}
          />
          <View style={styles.histModal}>
            <View style={styles.histModalHeader}>
              <Text style={styles.histModalTitulo}>
                {medidaDetalhe ? formatarData(medidaDetalhe.data) : ''}
              </Text>
              <TouchableOpacity onPress={() => setMedidaDetalhe(null)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.histModalBody}>
              {(() => {
                const m = medidaDetalhe;
                if (!m) return null;
                const linhas = [
                  m.peso && { label: 'Peso', valor: `${m.peso} kg` },
                  m.cintura && { label: 'Cintura', valor: `${m.cintura} cm` },
                  m.bracoEsq && { label: 'Braço E', valor: `${m.bracoEsq} cm` },
                  m.bracoDir && { label: 'Braço D', valor: `${m.bracoDir} cm` },
                  !m.bracoEsq &&
                    !m.bracoDir &&
                    m.braco && { label: 'Braço', valor: `${m.braco} cm` },
                  m.coxaEsq && { label: 'Coxa E', valor: `${m.coxaEsq} cm` },
                  m.coxaDir && { label: 'Coxa D', valor: `${m.coxaDir} cm` },
                  !m.coxaEsq &&
                    !m.coxaDir &&
                    m.coxa && { label: 'Coxa', valor: `${m.coxa} cm` },
                  m.peito && { label: 'Peitoral', valor: `${m.peito} cm` },
                  m.gorduraCorporal && {
                    label: 'Gordura Corp.',
                    valor: `${m.gorduraCorporal} %`,
                  },
                ].filter(Boolean) as { label: string; valor: string }[];

                return linhas.map((linha, i) => (
                  <View key={i} style={styles.histModalRow}>
                    <Text style={styles.histModalLabel}>{linha.label}</Text>
                    <Text style={styles.histModalValor}>{linha.valor}</Text>
                  </View>
                ));
              })()}
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
  scroll: {
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
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  botaoAdd: {
    backgroundColor: COR_PRIMARIA,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formCard: {
    backgroundColor: COR_CARD,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  formTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 14,
  },
  inputRow: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    padding: 14,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  botaoSalvar: {
    backgroundColor: COR_SUCESSO,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  botaoSalvarTexto: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  seletorLinha: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  metricaBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COR_CARD,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  metricaTexto: {
    fontSize: 12,
    fontWeight: '600',
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
  cardTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  chart: {
    borderRadius: 16,
    marginVertical: 8,
  },
  ultimoRegistro: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  ultimoValor: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  ultimoData: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },
  textoVazio: {
    color: '#666',
    textAlign: 'center',
    paddingVertical: 20,
    fontSize: 14,
  },
  histItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4a',
  },
  histItemData: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  histItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  botaoDeletar: {
    padding: 8,
  },
  histModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  histModalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  histModal: {
    backgroundColor: COR_FUNDO,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  histModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    marginBottom: 20,
  },
  histModalTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  histModalBody: {
    paddingBottom: 20,
  },
  histModalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4a',
  },
  histModalLabel: {
    fontSize: 15,
    color: '#888',
  },
  histModalValor: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
  },
});
