import { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useHistorico } from '../../src/hooks/useTreinos';
import CalendarioConcluidos from '../../src/components/treinos/CalendarioConcluidos';
import DetalheTreinoModal from '../../src/components/treinos/DetalheTreinoModal';
import { COR_FUNDO } from '../../src/utils/theme';

export default function ConcluidosScreen() {
  const { historico } = useHistorico();
  const [diaSelecionado, setDiaSelecionado] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <CalendarioConcluidos
          historico={historico}
          onDayPress={setDiaSelecionado}
        />
      </ScrollView>

      <DetalheTreinoModal
        visible={!!diaSelecionado}
        data={diaSelecionado || ''}
        historico={historico}
        onClose={() => setDiaSelecionado(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COR_FUNDO,
  },
  content: {
    padding: 20,
    paddingTop: 10,
  },
});
