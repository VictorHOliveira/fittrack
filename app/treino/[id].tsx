import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTreinos } from '../../src/hooks/useTreinos';
import { Treino } from '../../src/types';
import { useExercicios } from '../../src/hooks/useExercicios';
import ExercicioGif from '../../src/components/ExercicioGif';
import {
  COR_PRIMARIA,
  COR_FUNDO,
  COR_CARD,
  COR_SUCESSO,
} from '../../src/utils/theme';

export default function TreinoDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { treinos } = useTreinos();
  const [treino, setTreino] = useState<Treino | null>(null);
  const { find } = useExercicios();

  useEffect(() => {
    const t = treinos.find((t) => t.id === id);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (t) setTreino(t);
  }, [treinos, id]);

  if (!treino) {
    return (
      <View style={styles.container}>
        <Text style={styles.textoVazio}>Treino não encontrado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.titulo}>{treino.nome}</Text>
        {treino.descricao ? (
          <Text style={styles.descricao}>{treino.descricao}</Text>
        ) : null}
        {treino.diaSemana &&
        (Array.isArray(treino.diaSemana)
          ? treino.diaSemana.length > 0
          : true) ? (
          <Text style={styles.dia}>
            {Array.isArray(treino.diaSemana)
              ? treino.diaSemana.join(', ')
              : treino.diaSemana}
          </Text>
        ) : null}
        <Text style={styles.totalExercicios}>
          {treino.exercicios.length} exercício(s) •{' '}
          {treino.exercicios.reduce((acc, e) => acc + e.series.length, 0)}{' '}
          séries totais
        </Text>
      </View>

      <Text style={styles.secaoTitulo}>Exercícios</Text>

      <FlatList
        data={treino.exercicios}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={styles.lista}
        renderItem={({ item }) => {
          const info = find(item.exercicioId);
          const nomeIcone = info?.icone || 'fitness';
          return (
            <View style={styles.card}>
              <View style={styles.cardContent}>
                <ExercicioGif
                  exercicioId={item.exercicioId}
                  icone={nomeIcone}
                  corGrupo={info?.corGrupo || COR_PRIMARIA}
                  size={44}
                  borderRadius={12}
                />
                <View style={styles.cardInfo}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardNome}>
                      {info?.nome || item.exercicioId}
                    </Text>
                    <Text style={styles.cardMusculo}>{info?.musculo}</Text>
                  </View>
                  <Text style={styles.cardSeries}>
                    {item.series.length} séries • {item.descanso}s descanso
                  </Text>
                </View>
              </View>
            </View>
          );
        }}
      />

      <TouchableOpacity
        style={styles.botaoIniciar}
        onPress={() => router.push(`/treino/executar/${treino.id}`)}
      >
        <Ionicons name="play-circle" size={24} color="#fff" />
        <Text style={styles.botaoIniciarTexto}>Iniciar Treino</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COR_FUNDO,
    padding: 20,
  },
  textoVazio: {
    color: '#888',
    textAlign: 'center',
    marginTop: 40,
  },
  info: {
    marginBottom: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  descricao: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 4,
  },
  dia: {
    fontSize: 14,
    color: COR_PRIMARIA,
    marginBottom: 4,
  },
  totalExercicios: {
    fontSize: 13,
    color: '#666',
  },
  secaoTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#888',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  lista: {
    gap: 10,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: COR_CARD,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#333',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardNome: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  cardMusculo: {
    fontSize: 11,
    color: COR_PRIMARIA,
    backgroundColor: 'rgba(108,99,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  cardSeries: {
    fontSize: 12,
    color: '#888',
  },
  botaoIniciar: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: COR_SUCESSO,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  botaoIniciarTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
