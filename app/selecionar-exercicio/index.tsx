import { useState, useCallback, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ListaExercicios from '../../src/components/ListaExercicios';
import DetalhesExercicioModal from '../../src/components/DetalhesExercicioModal';
import { confirmarSelecao } from '../../src/utils/selecionarExercicioState';
import { Exercicio } from '../../src/types';
import { COR_FUNDO, COR_PRIMARIA } from '../../src/utils/theme';

export default function SelecionarExercicioScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [exercicioDetalhe, setExercicioDetalhe] = useState<Exercicio | null>(
    null,
  );

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleAdicionar = () => {
    if (selectedIds.size === 0) return;
    confirmarSelecao([...selectedIds]);
    router.dismiss();
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        selectedIds.size > 0 ? (
          <TouchableOpacity
            onPress={handleAdicionar}
            style={styles.headerBotao}
            activeOpacity={0.7}
          >
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.headerBotaoTexto}>
              Adicionar ({selectedIds.size})
            </Text>
          </TouchableOpacity>
        ) : null,
    });
  }, [navigation, selectedIds]);

  return (
    <View style={styles.container}>
      <ListaExercicios
        selecionaveis
        idsSelecionados={selectedIds}
        mostrarPR={false}
        mostrarDescricao={false}
        onDetalhe={setExercicioDetalhe}
        onSelect={toggle}
        onCriarExercicio={() => router.push('/criar-exercicio')}
      />

      <DetalhesExercicioModal
        exercicio={exercicioDetalhe}
        visible={!!exercicioDetalhe}
        onClose={() => setExercicioDetalhe(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COR_FUNDO,
  },
  headerBotao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COR_PRIMARIA,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 4,
  },
  headerBotaoTexto: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#fff',
  },
});
