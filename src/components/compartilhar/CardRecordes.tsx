import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CardBase from './CardBase';
import { COR_CARD, COR_SUCESSO } from '../../utils/theme';

interface RecordeItem {
  exercicioNome: string;
  cargaAntiga: number;
  cargaNova: number;
  repeticoesNovas: number;
}

interface Props {
  recordes: RecordeItem[];
}

export default function CardRecordes(props: Props) {
  return (
    <CardBase>
      <View style={styles.header}>
        <Ionicons name="trophy" size={32} color="#FFD700" />
        <Text style={styles.titulo}>RECORDES</Text>
      </View>

      {props.recordes.length > 0 ? (
        <>
          <Text style={styles.subtitulo}>
            Você bateu {props.recordes.length} recorde
            {props.recordes.length > 1 ? 's' : ''} neste treino!
          </Text>
          {props.recordes.map((r, i) => (
            <View key={i} style={styles.recordeRow}>
              <View style={styles.recordeHeader}>
                <Ionicons name="flame" size={16} color="#FFD700" />
                <Text style={styles.recordeNome} numberOfLines={1}>
                  {r.exercicioNome}
                </Text>
              </View>
              <View style={styles.recordeValores}>
                <Text style={styles.recordeAntes}>{r.cargaAntiga} kg</Text>
                <Ionicons name="arrow-forward" size={14} color="#666" />
                <Text style={styles.recordeAgora}>{r.cargaNova} kg</Text>
                <Text style={styles.recordeReps}>x{r.repeticoesNovas}</Text>
              </View>
            </View>
          ))}
        </>
      ) : (
        <View style={styles.semRecordes}>
          <Ionicons name="rocket-outline" size={24} color="#666" />
          <Text style={styles.semRecordesTexto}>
            Continue treinando! Seus recordes estão por vir.
          </Text>
        </View>
      )}
    </CardBase>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginBottom: 12 },
  titulo: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 2,
    marginTop: 6,
  },
  subtitulo: {
    fontSize: 12,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 16,
  },
  recordeRow: {
    backgroundColor: COR_CARD,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  recordeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  recordeNome: { fontSize: 14, color: '#fff', fontWeight: '600', flex: 1 },
  recordeValores: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 22,
  },
  recordeAntes: {
    fontSize: 13,
    color: '#666',
    textDecorationLine: 'line-through',
  },
  recordeAgora: { fontSize: 15, color: COR_SUCESSO, fontWeight: 'bold' },
  recordeReps: { fontSize: 12, color: '#888' },
  semRecordes: { alignItems: 'center', gap: 10, paddingVertical: 24 },
  semRecordesTexto: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
