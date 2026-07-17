import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ExercicioGif from './ExercicioGif';
import { useRecordes } from '../hooks/useRecordes';
import { COR_PRIMARIA, COR_FUNDO, COR_CARD, ICON_MAP } from '../utils/theme';

interface ExercicioData {
  id: string;
  nome: string;
  musculo: string;
  icone: string;
  corGrupo: string;
  descricao: string;
  equipamento?: string;
  personalizado?: boolean;
}

interface Props {
  exercicio: ExercicioData | null;
  visible: boolean;
  onClose: () => void;
}

export default function DetalhesExercicioModal({
  exercicio,
  visible,
  onClose,
}: Props) {
  const insets = useSafeAreaInsets();
  const { recordes } = useRecordes();

  if (!exercicio) return null;

  const pr = recordes[exercicio.id];
  const nomeIcone = ICON_MAP[exercicio.icone] || 'fitness';

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
        <View style={[styles.modal, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity style={styles.btnFechar} onPress={onClose}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>

          <ScrollView
            contentContainerStyle={styles.conteudo}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.gifWrapper}>
              <ExercicioGif
                exercicioId={exercicio.id}
                icone={nomeIcone}
                corGrupo={exercicio.corGrupo}
                size={180}
                borderRadius={20}
              />
            </View>

            <Text style={styles.nome}>{exercicio.nome}</Text>

            <View style={styles.musculoBadge}>
              <View
                style={[
                  styles.musculoDot,
                  { backgroundColor: exercicio.corGrupo },
                ]}
              />
              <Text style={styles.musculoTexto}>{exercicio.musculo}</Text>
            </View>

            <Text style={styles.descricao}>{exercicio.descricao}</Text>

            {exercicio.equipamento && (
              <View style={styles.infoRow}>
                <Ionicons name="construct" size={16} color="#888" />
                <Text style={styles.infoTexto}>{exercicio.equipamento}</Text>
              </View>
            )}

            {pr && (
              <View style={styles.prCard}>
                <Ionicons name="trophy" size={20} color="#FFD700" />
                <View style={styles.prInfo}>
                  <Text style={styles.prLabel}>Recorde Pessoal</Text>
                  <Text style={styles.prValor}>
                    {pr.carga} kg × {pr.repeticoes} reps
                  </Text>
                </View>
              </View>
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
    maxHeight: '85%',
    paddingHorizontal: 24,
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
  gifWrapper: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COR_CARD,
  },
  nome: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  musculoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COR_CARD,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  musculoDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  musculoTexto: {
    fontSize: 14,
    color: COR_PRIMARIA,
    fontWeight: '600',
  },
  descricao: {
    fontSize: 15,
    color: '#ccc',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  infoTexto: {
    fontSize: 14,
    color: '#888',
  },
  prCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFD700' + '15',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    width: '100%',
  },
  prInfo: {
    flex: 1,
  },
  prLabel: {
    fontSize: 12,
    color: '#FFD700',
    opacity: 0.7,
  },
  prValor: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: 'bold',
  },
});
