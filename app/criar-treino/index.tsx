import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTreinos } from '../../src/hooks/useTreinos';
import { ExercicioTreino } from '../../src/types';
import { pegarSelecionados } from '../../src/utils/selecionarExercicioState';
import { useExercicios } from '../../src/hooks/useExercicios';
import {
  criarExercicioTreino,
  construirTreino,
} from '../../src/hooks/useCriarTreino';
import {
  COR_PRIMARIA,
  COR_FUNDO,
  COR_CARD,
  COR_SUCESSO,
} from '../../src/utils/theme';

const DIAS_SEMANA = [
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
  'Domingo',
];

export default function CriarTreinoScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { treinos, adicionarOuEditarTreino } = useTreinos();

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [diaSemana, setDiaSemana] = useState<string[]>([]);
  const [exercicios, setExercicios] = useState<ExercicioTreino[]>([]);
  const { find } = useExercicios();
  const treinoCarregado = useRef(false);

  const adicionarExercicio = (exercicioId: string) => {
    setExercicios((prev) => [...prev, criarExercicioTreino(exercicioId)]);
  };

  useEffect(() => {
    if (id && !treinoCarregado.current) {
      const treino = treinos.find((t) => t.id === id);
      if (treino) {
        treinoCarregado.current = true;
        // eslint-disable-next-line react-hooks/set-state-in-effect -- sync treino data from route params
        setNome(treino.nome);
        setDescricao(treino.descricao || '');
        setDiaSemana(
          Array.isArray(treino.diaSemana)
            ? treino.diaSemana
            : treino.diaSemana
              ? [treino.diaSemana]
              : [],
        );
        setExercicios(treino.exercicios);
      }
    }
  }, [id, treinos]);

  useFocusEffect(
    useCallback(() => {
      const resultados = pegarSelecionados();
      resultados.forEach((id) => adicionarExercicio(id));
    }, []),
  );

  const removerExercicio = (index: number) => {
    setExercicios((prev) => prev.filter((_, i) => i !== index));
  };

  const adicionarSerie = (exIndex: number) => {
    setExercicios((prev) => {
      const novos = [...prev];
      const ex = novos[exIndex];
      novos[exIndex] = {
        ...ex,
        series: [
          ...ex.series,
          criarExercicioTreino(ex.exercicioId, 1).series[0],
        ],
      };
      return novos;
    });
  };

  const removerSerie = (exIndex: number) => {
    setExercicios((prev) => {
      const novos = [...prev];
      const ex = novos[exIndex];
      if (ex.series.length <= 1) return novos;
      novos[exIndex] = {
        ...ex,
        series: ex.series.slice(0, -1),
      };
      return novos;
    });
  };

  const salvar = async () => {
    if (!nome.trim()) {
      Alert.alert('Erro', 'Digite o nome do treino');
      return;
    }
    if (exercicios.length === 0) {
      Alert.alert('Erro', 'Adicione pelo menos um exercício');
      return;
    }

    const treino = construirTreino({
      id,
      nome,
      descricao,
      diaSemana,
      exercicios,
    });

    await adicionarOuEditarTreino(treino);
    router.back();
  };

  const getExercicioInfo = (exercicioId: string) => {
    return find(exercicioId);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.label}>Nome do Treino</Text>
        <TextInput
          style={styles.input}
          value={nome}
          onChangeText={setNome}
          placeholder="Ex: Treino A - Peito e Tríceps"
          placeholderTextColor="#555"
        />

        <Text style={styles.label}>Descrição (opcional)</Text>
        <TextInput
          style={styles.input}
          value={descricao}
          onChangeText={setDescricao}
          placeholder="Descreva o treino..."
          placeholderTextColor="#555"
        />

        <Text style={styles.label}>Dia da Semana</Text>
        <View style={styles.diasContainer}>
          {DIAS_SEMANA.map((dia) => (
            <TouchableOpacity
              key={dia}
              style={[
                styles.diaBotao,
                diaSemana.includes(dia) && styles.diaBotaoAtivo,
              ]}
              onPress={() =>
                setDiaSemana(
                  diaSemana.includes(dia)
                    ? diaSemana.filter((d) => d !== dia)
                    : [...diaSemana, dia],
                )
              }
            >
              <Text
                style={[
                  styles.diaTexto,
                  diaSemana.includes(dia) && styles.diaTextoAtivo,
                ]}
              >
                {dia.slice(0, 3)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.headerExercicios}>
          <Text style={styles.label}>Exercícios ({exercicios.length})</Text>
          <TouchableOpacity
            style={styles.botaoAdicionarEx}
            onPress={() => router.push('/selecionar-exercicio')}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.botaoAdicionarExTexto}>Adicionar</Text>
          </TouchableOpacity>
        </View>

        {exercicios.map((ex, exIndex) => {
          const info = getExercicioInfo(ex.exercicioId);
          return (
            <View key={exIndex} style={styles.exercicioCard}>
              <View style={styles.exercicioHeader}>
                <View style={styles.exercicioInfo}>
                  <Text style={styles.exercicioNome}>
                    {info?.nome || ex.exercicioId}
                  </Text>
                  <Text style={styles.exercicioMusculo}>{info?.musculo}</Text>
                </View>
                <TouchableOpacity onPress={() => removerExercicio(exIndex)}>
                  <Ionicons name="close-circle" size={24} color="#ff6b6b" />
                </TouchableOpacity>
              </View>

              <View style={styles.seriesInfo}>
                <Text style={styles.seriesLabel}>
                  {ex.series.length} séries
                </Text>
                <View style={styles.seriesBotoes}>
                  <TouchableOpacity
                    onPress={() => removerSerie(exIndex)}
                    style={styles.botaoSerie}
                  >
                    <Ionicons name="remove" size={18} color="#888" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => adicionarSerie(exIndex)}
                    style={styles.botaoSerie}
                  >
                    <Ionicons name="add" size={18} color="#888" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <TouchableOpacity style={styles.botaoSalvar} onPress={salvar}>
        <Ionicons name="checkmark-circle" size={24} color="#fff" />
        <Text style={styles.botaoSalvarTexto}>
          {id ? 'Salvar Alterações' : 'Criar Treino'}
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
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#888',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: COR_CARD,
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  diasContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  diaBotao: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COR_CARD,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  diaBotaoAtivo: {
    backgroundColor: COR_PRIMARIA,
    borderColor: COR_PRIMARIA,
  },
  diaTexto: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
  },
  diaTextoAtivo: {
    color: '#fff',
  },
  headerExercicios: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  botaoAdicionarEx: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COR_PRIMARIA,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  botaoAdicionarExTexto: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  exercicioCard: {
    backgroundColor: COR_CARD,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  exercicioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exercicioInfo: {
    flex: 1,
  },
  exercicioNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  exercicioMusculo: {
    fontSize: 12,
    color: COR_PRIMARIA,
  },
  seriesInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seriesLabel: {
    fontSize: 13,
    color: '#888',
  },
  seriesBotoes: {
    flexDirection: 'row',
    gap: 8,
  },
  botaoSerie: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2a2a4a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoSalvar: {
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
  botaoSalvarTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
