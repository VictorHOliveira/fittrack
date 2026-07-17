import { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRecordes } from '../hooks/useRecordes';
import { useExercicios } from '../hooks/useExercicios';
import { Exercicio } from '../types';
import { COR_PRIMARIA, COR_FUNDO, COR_CARD, ICON_MAP } from '../utils/theme';
import ExercicioGif from './ExercicioGif';

interface Props {
  onSelect?: (exercicioId: string) => void;
  onDetalhe?: (exercicio: Exercicio) => void;
  onCriarExercicio?: () => void;
  selecionaveis?: boolean;
  idsJaAdicionados?: string[];
  idsSelecionados?: Set<string>;
  mostrarPR?: boolean;
  mostrarDescricao?: boolean;
}

export default function ListaExercicios({
  onSelect,
  onDetalhe,
  onCriarExercicio,
  selecionaveis = false,
  idsJaAdicionados = [],
  idsSelecionados,
  mostrarPR = true,
  mostrarDescricao = true,
}: Props) {
  const { recordes } = useRecordes();
  const { exercicios: todosExercicios } = useExercicios();
  const [busca, setBusca] = useState('');
  const [musculoFiltro, setMusculoFiltro] = useState('');
  const MUSCULOS = useMemo(
    () => [...new Set(todosExercicios.map((e) => e.musculo))],
    [todosExercicios],
  );

  const exerciciosFiltrados = useMemo(
    () =>
      todosExercicios.filter((ex) => {
        const matchBusca = ex.nome.toLowerCase().includes(busca.toLowerCase());
        const matchMusculo = !musculoFiltro || ex.musculo === musculoFiltro;
        return matchBusca && matchMusculo;
      }),
    [todosExercicios, busca, musculoFiltro],
  );

  const renderItem = useCallback(
    ({ item }: { item: Exercicio }) => {
      const pr = recordes[item.id];
      const nomeIcone = ICON_MAP[item.icone] || 'fitness';
      const jaAdicionado = idsJaAdicionados.includes(item.id);
      const estaSelecionado = idsSelecionados?.has(item.id);

      const card = (
        <View
          style={[
            styles.card,
            selecionaveis && styles.cardSelecionavel,
            estaSelecionado && styles.cardSelecionado,
          ]}
        >
          <ExercicioGif
            exercicioId={item.id}
            icone={nomeIcone}
            corGrupo={item.corGrupo}
          />
          <View style={styles.cardConteudo}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardNome}>{item.nome}</Text>
              {item.personalizado && (
                <View style={styles.customBadge}>
                  <Ionicons name="create" size={10} color="#fff" />
                  <Text style={styles.customBadgeTexto}>Custom</Text>
                </View>
              )}
              {mostrarPR && pr && (
                <View style={styles.prBadge}>
                  <Ionicons name="trophy" size={12} color="#FFD700" />
                  <Text style={styles.prBadgeTexto}>{pr.carga}kg</Text>
                </View>
              )}
              {onDetalhe && (
                <TouchableOpacity
                  style={styles.infoBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  onPress={(e) => {
                    e.stopPropagation();
                    onDetalhe(item);
                  }}
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={18}
                    color="#888"
                  />
                </TouchableOpacity>
              )}
              {jaAdicionado && (
                <View style={styles.checkBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                </View>
              )}
              {estaSelecionado && (
                <View style={styles.checkBadge}>
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={COR_PRIMARIA}
                  />
                </View>
              )}
            </View>
            <Text style={styles.cardMusculo}>{item.musculo}</Text>
            {mostrarDescricao && (
              <Text style={styles.cardDescricao} numberOfLines={2}>
                {item.descricao}
              </Text>
            )}
            {item.equipamento && (
              <Text style={styles.cardEquipamento}>
                <Ionicons name="construct" size={11} color="#555" />{' '}
                {item.equipamento}
              </Text>
            )}
          </View>
        </View>
      );

      if (selecionaveis && onSelect) {
        return (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onSelect(item.id)}
          >
            {card}
          </TouchableOpacity>
        );
      }

      if (onDetalhe) {
        return (
          <TouchableOpacity activeOpacity={0.7} onPress={() => onDetalhe(item)}>
            {card}
          </TouchableOpacity>
        );
      }

      return card;
    },
    [
      recordes,
      idsJaAdicionados,
      idsSelecionados,
      selecionaveis,
      onSelect,
      onDetalhe,
      mostrarPR,
      mostrarDescricao,
    ],
  );

  const ListHeader = useMemo(
    () => (
      <View>
        <TextInput
          style={styles.input}
          value={busca}
          onChangeText={setBusca}
          placeholder="Buscar exercício..."
          placeholderTextColor="#555"
        />

        <FlatList
          horizontal
          data={MUSCULOS}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtros}
          keyExtractor={(m) => m}
          renderItem={({ item: musculo }) => (
            <TouchableOpacity
              style={[
                styles.filtro,
                musculoFiltro === musculo && styles.filtroAtivo,
              ]}
              onPress={() =>
                setMusculoFiltro(musculoFiltro === musculo ? '' : musculo)
              }
            >
              <Text
                style={[
                  styles.filtroTexto,
                  musculoFiltro === musculo && styles.filtroTextoAtivo,
                ]}
              >
                {musculo}
              </Text>
            </TouchableOpacity>
          )}
        />

        {onCriarExercicio && (
          <TouchableOpacity
            style={styles.criarBtn}
            activeOpacity={0.8}
            onPress={onCriarExercicio}
          >
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={styles.criarBtnTexto}>Criar Exercício</Text>
          </TouchableOpacity>
        )}
      </View>
    ),
    [busca, musculoFiltro, MUSCULOS, onCriarExercicio],
  );

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.lista}
      data={exerciciosFiltrados}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListHeaderComponent={ListHeader}
      removeClippedSubviews
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COR_FUNDO,
  },
  input: {
    backgroundColor: COR_CARD,
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  filtros: {
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filtro: {
    height: 42,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: COR_CARD,
    borderWidth: 1,
    borderColor: '#333',
  },
  filtroAtivo: {
    backgroundColor: COR_PRIMARIA,
    borderColor: COR_PRIMARIA,
  },
  filtroTexto: {
    color: '#888',
    fontSize: 13,
    fontWeight: '600',
  },
  filtroTextoAtivo: {
    color: '#fff',
  },
  criarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COR_PRIMARIA,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  criarBtnTexto: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  lista: {
    paddingHorizontal: 20,
    gap: 10,
    paddingBottom: 40,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: COR_CARD,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#333',
    gap: 12,
  },
  cardSelecionavel: {
    borderColor: COR_PRIMARIA + '30',
  },
  cardSelecionado: {
    borderColor: COR_PRIMARIA,
    backgroundColor: COR_PRIMARIA + '10',
  },
  cardConteudo: {
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
  customBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COR_PRIMARIA + '40',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 6,
  },
  customBadgeTexto: {
    fontSize: 9,
    color: COR_PRIMARIA,
    fontWeight: 'bold',
  },
  prBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFD700' + '18',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  prBadgeTexto: {
    fontSize: 11,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  checkBadge: {
    marginLeft: 6,
  },
  infoBtn: {
    marginLeft: 6,
    padding: 2,
  },
  cardMusculo: {
    fontSize: 12,
    color: COR_PRIMARIA,
    marginBottom: 4,
  },
  cardDescricao: {
    fontSize: 12,
    color: '#888',
    lineHeight: 17,
    marginBottom: 4,
  },
  cardEquipamento: {
    fontSize: 11,
    color: '#555',
  },
});
