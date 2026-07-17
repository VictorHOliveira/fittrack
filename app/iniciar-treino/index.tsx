import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTreinos } from '../../src/hooks/useTreinos';
import { COR_FUNDO, COR_CARD, COR_PRIMARIA } from '../../src/utils/theme';

export default function IniciarTreinoScreen() {
  const router = useRouter();
  const { treinos } = useTreinos();

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Selecione o treino para iniciar</Text>
      <Text style={styles.subtitulo}>
        {treinos.length} treino(s) disponível(is)
      </Text>

      <FlatList
        data={treinos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/treino/executar/${item.id}`)}
            activeOpacity={0.7}
          >
            <View style={styles.cardIcone}>
              <Ionicons name="barbell" size={24} color={COR_PRIMARIA} />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardNome}>{item.nome}</Text>
              {item.diaSemana &&
              (Array.isArray(item.diaSemana)
                ? item.diaSemana.length > 0
                : true) ? (
                <Text style={styles.cardDia}>
                  {Array.isArray(item.diaSemana)
                    ? item.diaSemana.join(', ')
                    : item.diaSemana}
                </Text>
              ) : null}
              <Text style={styles.cardExCount}>
                {item.exercicios.length} exercício(s)
              </Text>
            </View>
            <Ionicons name="play-circle" size={28} color={COR_PRIMARIA} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.vazio}>
            <Ionicons name="barbell-outline" size={48} color="#555" />
            <Text style={styles.vazioTexto}>Nenhum treino criado ainda</Text>
            <TouchableOpacity
              style={styles.vazioBotao}
              onPress={() => router.push('/criar-treino')}
            >
              <Text style={styles.vazioBotaoTexto}>Criar Treino</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COR_FUNDO, padding: 20 },
  titulo: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  subtitulo: { fontSize: 13, color: '#888', marginBottom: 20 },
  lista: { gap: 12, paddingBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COR_CARD,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
    gap: 12,
  },
  cardIcone: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COR_PRIMARIA + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: { flex: 1 },
  cardNome: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  cardDia: { fontSize: 12, color: COR_PRIMARIA, marginTop: 2 },
  cardExCount: { fontSize: 12, color: '#888', marginTop: 2 },
  vazio: { alignItems: 'center', paddingTop: 60, gap: 12 },
  vazioTexto: { fontSize: 14, color: '#888' },
  vazioBotao: {
    backgroundColor: COR_PRIMARIA,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 8,
  },
  vazioBotaoTexto: { color: '#fff', fontWeight: 'bold' },
});
