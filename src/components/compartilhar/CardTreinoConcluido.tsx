import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CardBase from './CardBase';
import { COR_PRIMARIA, COR_CARD } from '../../utils/theme';
import { formatarDuracao, formatarDataLonga } from '../../utils/format';

interface ExercicioResumo {
  nome: string;
  volume: number;
}

interface Props {
  treinoNome: string;
  dataExecucao: string;
  duracao: string;
  totalVolume: number;
  totalSeries: number;
  totalExercicios: number;
  perfilNome: string;
  exercicios: ExercicioResumo[];
}

export default function CardTreinoConcluido(props: Props) {
  return (
    <CardBase>
      <View style={styles.header}>
        <Ionicons name="checkmark-circle" size={40} color="#4CAF50" />
        <Text style={styles.label}>TREINO CONCLUÍDO</Text>
        <Text style={styles.nome}>{props.perfilNome}</Text>
        <Text style={styles.meta}>
          {formatarDataLonga(props.dataExecucao)} •{' '}
          {formatarDuracao(Number(props.duracao))}
        </Text>
        <Text style={styles.treinoNome}>{props.treinoNome}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="barbell" size={20} color={COR_PRIMARIA} />
          <Text style={styles.statNumero}>{props.totalVolume} kg</Text>
          <Text style={styles.statLabel}>Volume</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="layers" size={20} color={COR_PRIMARIA} />
          <Text style={styles.statNumero}>{props.totalSeries}</Text>
          <Text style={styles.statLabel}>Séries</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="fitness" size={20} color={COR_PRIMARIA} />
          <Text style={styles.statNumero}>{props.totalExercicios}</Text>
          <Text style={styles.statLabel}>Exercícios</Text>
        </View>
      </View>

      {props.exercicios.length > 0 && (
        <>
          <Text style={styles.sectionTitulo}>EXERCÍCIOS</Text>
          {props.exercicios.map((ex, i) => (
            <View key={i} style={styles.exRow}>
              <Text style={styles.exNome} numberOfLines={1}>
                {ex.nome}
              </Text>
              <Text style={styles.exVolume}>{ex.volume} kg</Text>
            </View>
          ))}
        </>
      )}
    </CardBase>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginBottom: 20 },
  label: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
    letterSpacing: 2,
    marginTop: 8,
    marginBottom: 6,
  },
  nome: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  meta: { fontSize: 12, color: '#888', marginBottom: 8 },
  treinoNome: { fontSize: 14, color: COR_PRIMARIA, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: COR_CARD,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  statNumero: { fontSize: 13, fontWeight: 'bold', color: '#fff' },
  statLabel: { fontSize: 10, color: '#888', fontWeight: '600' },
  sectionTitulo: {
    fontSize: 11,
    color: '#888',
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 8,
  },
  exRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: COR_CARD,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 6,
  },
  exNome: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  exVolume: { fontSize: 13, color: COR_PRIMARIA, fontWeight: 'bold' },
});
