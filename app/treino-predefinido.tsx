import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TreinoPreDefinido } from '../src/types';
import {
  listarTreinosPreDefinidos,
  jaImportouTreino,
} from '../src/utils/storage';
import { useExercicios } from '../src/hooks/useExercicios';
import { useTreinos } from '../src/hooks/useTreinos';
import { importarPreDefinido } from '../src/hooks/useCriarTreino';
import {
  COR_PRIMARIA,
  COR_FUNDO,
  COR_CARD,
  NIVEL_CORES,
  NIVEL_LABELS,
} from '../src/utils/theme';

export default function TreinoPreDefinidoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [treino, setTreino] = useState<TreinoPreDefinido | null>(null);
  const [jaImportado, setJaImportado] = useState(false);
  const [importando, setImportando] = useState(false);
  const { find } = useExercicios();
  const { adicionarOuEditarTreino } = useTreinos();

  useEffect(() => {
    (async () => {
      const treinos = await listarTreinosPreDefinidos();
      const encontrado = treinos.find((t: TreinoPreDefinido) => t.id === id);
      setTreino(encontrado || null);
      if (id) {
        const existe = await jaImportouTreino(id);
        setJaImportado(existe);
      }
    })();
  }, [id]);

  const handleImportar = async () => {
    if (!id || importando || !treino) return;
    setImportando(true);
    const converted = importarPreDefinido(treino);
    await adicionarOuEditarTreino(converted);
    setImportando(false);
    setJaImportado(true);
    Alert.alert(
      'Sucesso',
      'Treino importado! Você o encontra na aba Treinos.',
      [{ text: 'OK', onPress: () => router.back() }],
    );
  };

  if (!treino) {
    return (
      <View style={styles.container}>
        <Text style={styles.vazio}>Treino não encontrado</Text>
      </View>
    );
  }

  const corNivel = NIVEL_CORES[treino.nivel] || COR_PRIMARIA;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.nivelBadge, { backgroundColor: corNivel + '20' }]}>
          <View style={[styles.nivelDot, { backgroundColor: corNivel }]} />
          <Text style={[styles.nivelTexto, { color: corNivel }]}>
            {NIVEL_LABELS[treino.nivel]}
          </Text>
        </View>

        <Text style={styles.nome}>{treino.nome}</Text>
        <Text style={styles.descricao}>{treino.descricao}</Text>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="calendar" size={18} color={COR_PRIMARIA} />
            <Text style={styles.infoTexto}>
              {treino.frequenciaSemanal}x/semana
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="time" size={18} color={COR_PRIMARIA} />
            <Text style={styles.infoTexto}>~{treino.duracaoEstimada} min</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="barbell" size={18} color={COR_PRIMARIA} />
            <Text style={styles.infoTexto}>{treino.dias.length} dias</Text>
          </View>
        </View>

        {treino.dias.map((dia, diaIndex) => (
          <View key={diaIndex} style={styles.diaCard}>
            <View style={styles.diaHeader}>
              <Text style={styles.diaNome}>{dia.nome}</Text>
              <Text style={styles.diaSemana}>{dia.diaDaSemana}</Text>
            </View>

            {dia.exercicios.map((ex, exIndex) => {
              const info = find(ex.exercicioId);
              return (
                <View key={exIndex} style={styles.exercicioItem}>
                  <View style={styles.exercicioInfo}>
                    <Text style={styles.exercicioNome}>
                      {info?.nome || ex.exercicioId}
                    </Text>
                    <Text style={styles.exercicioMusculo}>{info?.musculo}</Text>
                  </View>
                  <View style={styles.exercicioParams}>
                    <Text style={styles.paramTexto}>
                      {ex.series}x{ex.repeticoes}
                    </Text>
                    <Text style={styles.paramDescanso}>{ex.descanso}s</Text>
                  </View>
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[styles.botaoImportar, jaImportado && styles.botaoImportado]}
        onPress={handleImportar}
        disabled={jaImportado || importando}
      >
        <Ionicons
          name={jaImportado ? 'checkmark-circle' : 'download-outline'}
          size={22}
          color="#fff"
        />
        <Text style={styles.botaoImportarTexto}>
          {jaImportado
            ? 'Já Importado'
            : importando
              ? 'Importando...'
              : 'Importar Treino'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COR_FUNDO,
  },
  scroll: {
    padding: 20,
    paddingBottom: 100,
  },
  vazio: {
    color: '#888',
    textAlign: 'center',
    marginTop: 40,
  },
  nivelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginBottom: 12,
  },
  nivelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  nivelTexto: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  nome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  descricao: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoTexto: {
    fontSize: 13,
    color: '#aaa',
  },
  diaCard: {
    backgroundColor: COR_CARD,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  diaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  diaNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  diaSemana: {
    fontSize: 12,
    color: COR_PRIMARIA,
    fontWeight: '600',
    backgroundColor: COR_PRIMARIA + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  exercicioItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4a',
  },
  exercicioInfo: {
    flex: 1,
  },
  exercicioNome: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  exercicioMusculo: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  exercicioParams: {
    alignItems: 'flex-end',
    gap: 2,
  },
  paramTexto: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COR_PRIMARIA,
  },
  paramDescanso: {
    fontSize: 11,
    color: '#666',
  },
  botaoImportar: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: COR_PRIMARIA,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  botaoImportado: {
    backgroundColor: '#333',
  },
  botaoImportarTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
