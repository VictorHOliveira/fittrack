import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CardBase from './CardBase';
import { COR_PRIMARIA, COR_CARD, COR_SUCESSO } from '../../utils/theme';

const DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

interface Props {
  totalTreinos: number;
  volumeTotal: number;
  aguaCopos: number;
  aguaMl: number;
  cardioMin: number;
  diasTreinados: boolean[];
}

export default function CardSemanal(props: Props) {
  return (
    <CardBase>
      <View style={styles.header}>
        <Ionicons name="calendar" size={28} color={COR_PRIMARIA} />
        <Text style={styles.titulo}>RESUMO DA SEMANA</Text>
      </View>

      <View style={styles.grid}>
        <View style={styles.gridCard}>
          <Ionicons name="barbell" size={18} color={COR_PRIMARIA} />
          <Text style={styles.gridNumero}>{props.totalTreinos}</Text>
          <Text style={styles.gridLabel}>Treinos</Text>
        </View>
        <View style={styles.gridCard}>
          <Ionicons name="trending-up" size={18} color={COR_PRIMARIA} />
          <Text style={styles.gridNumero}>{props.volumeTotal} kg</Text>
          <Text style={styles.gridLabel}>Volume</Text>
        </View>
        <View style={styles.gridCard}>
          <Ionicons name="water" size={18} color="#4FC3F7" />
          <Text style={styles.gridNumero}>{props.aguaCopos}</Text>
          <Text style={styles.gridLabel}>Copos</Text>
        </View>
        <View style={styles.gridCard}>
          <Ionicons name="pulse" size={18} color="#FF6B6B" />
          <Text style={styles.gridNumero}>{props.cardioMin} min</Text>
          <Text style={styles.gridLabel}>Cardio</Text>
        </View>
      </View>

      <View style={styles.diasSection}>
        <Text style={styles.diasLabel}>DIAS TREINADOS</Text>
        <View style={styles.diasRow}>
          {DIAS.map((dia, i) => {
            const ativo = props.diasTreinados[i] || false;
            return (
              <View key={i} style={[styles.diaItem, ativo && styles.diaAtivo]}>
                <Text style={[styles.diaTexto, ativo && styles.diaTextoAtivo]}>
                  {dia}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </CardBase>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginBottom: 16 },
  titulo: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 2,
    marginTop: 6,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  gridCard: {
    width: '47%',
    backgroundColor: COR_CARD,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  gridNumero: { fontSize: 14, fontWeight: 'bold', color: '#fff' },
  gridLabel: { fontSize: 10, color: '#888', fontWeight: '600' },
  diasSection: { marginBottom: 4 },
  diasLabel: {
    fontSize: 11,
    color: '#888',
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 10,
  },
  diasRow: { flexDirection: 'row', justifyContent: 'space-between' },
  diaItem: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COR_CARD,
    borderWidth: 1,
    borderColor: '#333',
  },
  diaAtivo: { backgroundColor: COR_SUCESSO, borderColor: COR_SUCESSO },
  diaTexto: { fontSize: 9, color: '#666', fontWeight: '600' },
  diaTextoAtivo: { color: '#fff' },
});
