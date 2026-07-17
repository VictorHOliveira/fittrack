import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAgua } from '../../hooks/useAgua';
import { COR_CARD } from '../../utils/theme';

const COR_AGUA = '#00BFFF';

export default function PainelAgua() {
  const router = useRouter();
  const { totalCoposHoje, totalMlHoje, config, carregando } = useAgua();

  if (carregando) return null;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push('/agua')}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Ionicons name="water" size={22} color={COR_AGUA} />
        <Text style={styles.titulo}>Água</Text>
      </View>
      <Text style={styles.progresso}>
        {totalCoposHoje}/{config.metaDiaria} copos • {totalMlHoje}ml
      </Text>
      <View style={styles.barraContainer}>
        <View
          style={[
            styles.barra,
            {
              width: `${Math.min((totalCoposHoje / config.metaDiaria) * 100, 100)}%`,
            },
          ]}
        />
      </View>
      <Text style={styles.hint}>Toque para registrar ou configurar</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COR_CARD,
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: COR_AGUA,
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
  progresso: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 10,
  },
  barraContainer: {
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  barra: {
    height: '100%',
    backgroundColor: COR_AGUA,
    borderRadius: 3,
  },
  hint: {
    fontSize: 11,
    color: '#666',
  },
});
