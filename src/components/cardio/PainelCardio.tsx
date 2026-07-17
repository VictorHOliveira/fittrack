import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCardio } from '../../hooks/useCardio';
import { COR_CARD } from '../../utils/theme';

const COR_CARDIO = '#FF6B35';

export default function PainelCardio() {
  const router = useRouter();
  const { entriesHoje, carregando } = useCardio();

  if (carregando) return null;

  const totalMin = entriesHoje.reduce((acc, e) => acc + e.duracaoMinutos, 0);
  const totalCal = entriesHoje.reduce((acc, e) => acc + e.calorias, 0);

  const label =
    totalMin > 0
      ? `${totalMin}min hoje • ${totalCal}kcal`
      : 'Nenhum cardio registrado hoje';

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push('/cardio')}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Ionicons name="pulse" size={22} color={COR_CARDIO} />
        <Text style={styles.titulo}>Cardio</Text>
      </View>
      <Text style={styles.texto}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COR_CARD,
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: COR_CARDIO,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  titulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  texto: {
    fontSize: 14,
    color: '#aaa',
  },
});
