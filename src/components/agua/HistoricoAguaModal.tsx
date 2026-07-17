import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RegistroAguaDiario } from '../../types';
import { COR_FUNDO, COR_CARD } from '../../utils/theme';
import { formatarDataCompleta } from '../../utils/format';

const COR_AGUA = '#00BFFF';

interface Props {
  visible: boolean;
  data: string;
  registros: RegistroAguaDiario[];
  onClose: () => void;
}

export default function HistoricoAguaModal({
  visible,
  data,
  registros,
  onClose,
}: Props) {
  const registro = registros.find((r) => r.data === data);
  const copos = registro?.copos || [];
  const totalMl = copos.reduce((acc, c) => acc + c.ml, 0);

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
          <TouchableOpacity style={styles.btnFechar} onPress={onClose}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>

          <ScrollView
            contentContainerStyle={styles.conteudo}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.headerIcon}>
              <Ionicons name="water" size={32} color={COR_AGUA} />
            </View>

            <Text style={styles.dataTexto}>{formatarDataCompleta(data)}</Text>

            {copos.length === 0 ? (
              <Text style={styles.semRegistro}>
                Nenhum registro de água neste dia.
              </Text>
            ) : (
              <>
                <View style={styles.totalCard}>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={COR_AGUA}
                  />
                  <Text style={styles.totalTexto}>
                    Total: {copos.length} copo{copos.length !== 1 ? 's' : ''} •{' '}
                    {totalMl}ml
                  </Text>
                </View>

                {copos.map((copo, idx) => (
                  <View key={idx} style={styles.copoItem}>
                    <Ionicons name="water" size={18} color={COR_AGUA} />
                    <Text style={styles.copoHora}>
                      {new Date(copo.timestamp).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                    <View style={styles.copoLinha} />
                    <Text style={styles.copoMl}>{copo.ml}ml</Text>
                  </View>
                ))}
              </>
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
    maxHeight: '70%',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  btnFechar: {
    alignSelf: 'flex-end',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COR_CARD,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  conteudo: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  headerIcon: {
    marginBottom: 12,
  },
  dataTexto: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  semRegistro: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    paddingVertical: 20,
  },
  copoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: COR_CARD,
    borderRadius: 12,
    marginBottom: 8,
    width: '100%',
  },
  copoHora: {
    fontSize: 14,
    color: '#aaa',
    fontWeight: '600',
    minWidth: 40,
  },
  copLinha: {
    flex: 1,
    height: 1,
    backgroundColor: '#333',
  },
  copoLinha: {
    flex: 1,
    height: 1,
    backgroundColor: '#333',
  },
  copoMl: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  totalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COR_CARD,
    borderRadius: 12,
    marginTop: 4,
    width: '100%',
    borderWidth: 1,
    borderColor: COR_AGUA + '40',
  },
  totalTexto: {
    fontSize: 14,
    color: COR_AGUA,
    fontWeight: 'bold',
  },
});
