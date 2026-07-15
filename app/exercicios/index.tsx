import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import ListaExercicios from '../../src/components/ListaExercicios';
import DetalhesExercicioModal from '../../src/components/DetalhesExercicioModal';
import { Exercicio } from '../../src/types';

const COR_FUNDO = '#1a1a2e';

export default function ExerciciosScreen() {
  const [exercicioDetalhe, setExercicioDetalhe] = useState<Exercicio | null>(null);

  return (
    <View style={styles.container}>
      <ListaExercicios onDetalhe={setExercicioDetalhe} />
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
});
