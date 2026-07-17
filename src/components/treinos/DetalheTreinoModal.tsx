import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TreinoCompleto } from '../../types';
import { COR_FUNDO, COR_CARD, COR_SUCESSO } from '../../utils/theme';
import { formatarDuracaoMinutos } from '../../utils/format';
import { useExercicios } from '../../hooks/useExercicios';

interface Props {
  visible: boolean;
  data: string;
  historico: TreinoCompleto[];
  onClose: () => void;
}

function formatarDataBR(dataISO: string): string {
  const [ano, mes, dia] = dataISO.split('-').map(Number);
  const data = new Date(ano, mes - 1, dia);
  return data.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function DetalheTreinoModal({
  visible,
  data,
  historico,
  onClose,
}: Props) {
  const treinosDoDia = historico.filter(
    (t) => t.dataExecucao.split('T')[0] === data,
  );
  const { getNome } = useExercicios();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.modal}>
          <View style={styles.header}>
            <View style={styles.headerInfo}>
              <Ionicons name="checkmark-circle" size={28} color={COR_SUCESSO} />
              <Text style={styles.dataTexto}>{formatarDataBR(data)}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.btnFechar}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.conteudo}
            showsVerticalScrollIndicator={false}
          >
            {treinosDoDia.length === 0 ? (
              <Text style={styles.semRegistro}>Nenhum treino neste dia.</Text>
            ) : (
              treinosDoDia.map((treino, ti) => (
                <View key={ti} style={styles.treinoCard}>
                  <Text style={styles.treinoNome}>{treino.treino.nome}</Text>
                  <Text style={styles.treinoMeta}>
                    {formatarDataBR(treino.dataExecucao)} •{' '}
                    {formatarDuracaoMinutos(treino.duracao)}
                  </Text>

                  {treino.exercicios.map((ex, ei) => {
                    const nomeEx = getNome(ex.exercicioId) || ex.exercicioId;
                    return (
                      <View key={ei} style={styles.exCard}>
                        <Text style={styles.exNome}>{nomeEx}</Text>
                        <View style={styles.exHeader}>
                          <Text style={styles.exCol}>Série</Text>
                          <Text style={styles.exCol}>Carga</Text>
                          <Text style={styles.exCol}>Reps</Text>
                        </View>
                        {ex.series.map((serie, si) => (
                          <View key={si} style={styles.exRow}>
                            <Text style={styles.exValor}>{si + 1}</Text>
                            <Text style={styles.exValor}>
                              {serie.cargas} kg
                            </Text>
                            <Text style={styles.exValor}>
                              {serie.repeticoes}
                            </Text>
                          </View>
                        ))}
                      </View>
                    );
                  })}
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modal: {
    backgroundColor: COR_FUNDO,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  dataTexto: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  btnFechar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COR_CARD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  conteudo: {
    paddingBottom: 20,
  },
  semRegistro: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    paddingVertical: 20,
  },
  treinoCard: {
    backgroundColor: COR_CARD,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 16,
  },
  treinoNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  treinoMeta: {
    fontSize: 13,
    color: '#888',
    marginBottom: 16,
  },
  exCard: {
    marginBottom: 16,
  },
  exNome: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  exHeader: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  exCol: {
    flex: 1,
    fontSize: 11,
    color: '#666',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  exRow: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  exValor: {
    flex: 1,
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
  },
});
