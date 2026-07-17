import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCardio, TIPOS_CARDIO } from '../../src/hooks/useCardio';
import { TipoCardio } from '../../src/types';
import { COR_FUNDO, COR_CARD, COR_SUCESSO } from '../../src/utils/theme';

const COR_CARDIO = '#FF6B35';

export default function AdicionarCardioScreen() {
  const router = useRouter();
  const { adicionar } = useCardio();

  const [tipo, setTipo] = useState<TipoCardio | null>(null);
  const [tipoOutro, setTipoOutro] = useState('');
  const [duracao, setDuracao] = useState('');
  const [calorias, setCalorias] = useState('');
  const [distancia, setDistancia] = useState('');
  const [observacao, setObservacao] = useState('');

  const handleSalvar = async () => {
    const dur = Number(duracao);
    if (!dur || dur < 1) {
      Alert.alert('Erro', 'Duração deve ser no mínimo 1 minuto');
      return;
    }

    await adicionar(
      tipo ?? 'outro',
      dur,
      Number(calorias) || 0,
      distancia ? Number(distancia) : undefined,
      tipo === 'outro' ? tipoOutro : undefined,
      observacao || undefined,
    );

    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.descricao}>
          Preencha os dados do seu treino cardio.
        </Text>

        <Text style={styles.label}>Tipo de Cardio</Text>
        <View style={styles.tiposContainer}>
          {TIPOS_CARDIO.map((t) => (
            <TouchableOpacity
              key={t.valor}
              style={[
                styles.tipoBotao,
                tipo === t.valor && styles.tipoBotaoAtivo,
              ]}
              onPress={() => setTipo(t.valor)}
            >
              <Ionicons
                name={t.icon as any}
                size={18}
                color={tipo === t.valor ? '#fff' : '#888'}
              />
              <Text
                style={[
                  styles.tipoTexto,
                  tipo === t.valor && styles.tipoTextoAtivo,
                ]}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {tipo === 'outro' && (
          <>
            <Text style={styles.label}>Qual?</Text>
            <TextInput
              style={styles.input}
              value={tipoOutro}
              onChangeText={setTipoOutro}
              placeholder="Ex: Remo, Crossfit..."
              placeholderTextColor="#555"
            />
          </>
        )}

        <View style={styles.linha}>
          <View style={styles.coluna}>
            <Text style={styles.label}>Duração (min)</Text>
            <TextInput
              style={styles.input}
              value={duracao}
              onChangeText={setDuracao}
              keyboardType="number-pad"
              placeholder="30"
              placeholderTextColor="#555"
            />
          </View>
          <View style={styles.coluna}>
            <Text style={styles.label}>Calorias</Text>
            <TextInput
              style={styles.input}
              value={calorias}
              onChangeText={setCalorias}
              keyboardType="number-pad"
              placeholder="250"
              placeholderTextColor="#555"
            />
          </View>
        </View>

        <Text style={styles.label}>Distância (km) — opcional</Text>
        <TextInput
          style={styles.input}
          value={distancia}
          onChangeText={setDistancia}
          keyboardType="decimal-pad"
          placeholder="Ex: 5.2"
          placeholderTextColor="#555"
        />

        <Text style={styles.label}>Observação — opcional</Text>
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          value={observacao}
          onChangeText={setObservacao}
          placeholder="Ex: Foi pesado, mas consegui!"
          placeholderTextColor="#555"
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        <TouchableOpacity style={styles.botaoSalvar} onPress={handleSalvar}>
          <Ionicons name="checkmark-circle" size={22} color="#fff" />
          <Text style={styles.botaoSalvarTexto}>Salvar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COR_FUNDO,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  descricao: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
    lineHeight: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#888',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tiposContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  tipoBotao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COR_CARD,
    borderWidth: 1,
    borderColor: '#333',
  },
  tipoBotaoAtivo: {
    backgroundColor: COR_CARDIO,
    borderColor: COR_CARDIO,
  },
  tipoTexto: {
    fontSize: 13,
    color: '#888',
    fontWeight: '600',
  },
  tipoTextoAtivo: {
    color: '#fff',
  },
  input: {
    backgroundColor: COR_CARD,
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 16,
  },
  inputMultiline: {
    minHeight: 80,
  },
  linha: {
    flexDirection: 'row',
    gap: 12,
  },
  coluna: {
    flex: 1,
  },
  botaoSalvar: {
    backgroundColor: COR_SUCESSO,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
  },
  botaoSalvarTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
