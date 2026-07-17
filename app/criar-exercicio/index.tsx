import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Exercicio } from '../../src/types';
import { gerarId } from '../../src/utils/storage';
import {
  carregarExerciciosPersonalizados,
  salvarExerciciosPersonalizados,
} from '../../src/services/firestoreService';
import {
  COR_PRIMARIA,
  COR_FUNDO,
  COR_CARD,
  COR_SUCESSO,
} from '../../src/utils/theme';

const MUSCULOS = [
  { nome: 'Peito', cor: '#e91e63' },
  { nome: 'Costas', cor: '#2196f3' },
  { nome: 'Pernas', cor: '#4caf50' },
  { nome: 'Quadríceps', cor: '#4caf50' },
  { nome: 'Posterior', cor: '#8bc34a' },
  { nome: 'Panturrilha', cor: '#689f38' },
  { nome: 'Ombros', cor: '#ff9800' },
  { nome: 'Bíceps', cor: '#f44336' },
  { nome: 'Tríceps', cor: '#e91e63' },
  { nome: 'Abdômen', cor: '#9c27b0' },
  { nome: 'Core', cor: '#673ab7' },
  { nome: 'Glúteo', cor: '#e040fb' },
  { nome: 'Cardio', cor: '#ff5722' },
  { nome: 'Lombar', cor: '#795548' },
  { nome: 'Antebraço', cor: '#607d8b' },
];

export default function CriarExercicioScreen() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [musculo, setMusculo] = useState('');
  const [equipamento, setEquipamento] = useState('');
  const [descricao, setDescricao] = useState('');

  const musculoSelecionado = MUSCULOS.find((m) => m.nome === musculo);

  const handleSalvar = async () => {
    if (!nome.trim()) {
      Alert.alert('Erro', 'Digite o nome do exercício');
      return;
    }
    if (!musculo) {
      Alert.alert('Erro', 'Selecione o grupo muscular');
      return;
    }

    const novoExercicio: Exercicio = {
      id: `custom-${gerarId()}`,
      nome: nome.trim(),
      musculo,
      icone: 'fitness',
      corGrupo: musculoSelecionado?.cor || COR_PRIMARIA,
      descricao: descricao.trim() || 'Exercício personalizado',
      equipamento: equipamento.trim() || undefined,
      personalizado: true,
    };

    const lista = await carregarExerciciosPersonalizados();
    const index = lista.findIndex((e) => e.id === novoExercicio.id);
    if (index >= 0) {
      lista[index] = novoExercicio;
    } else {
      lista.push(novoExercicio);
    }
    await salvarExerciciosPersonalizados(lista);
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.botaoVoltar}
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.titulo}>Criar Exercício</Text>
        </View>

        <Text style={styles.label}>Nome do exercício</Text>
        <TextInput
          style={styles.input}
          value={nome}
          onChangeText={setNome}
          placeholder="Ex: Elevação Lateral"
          placeholderTextColor="#555"
        />

        <Text style={styles.label}>Grupo muscular *</Text>
        <View style={styles.musculosContainer}>
          {MUSCULOS.map((m) => (
            <TouchableOpacity
              key={m.nome}
              style={[
                styles.musculoBotao,
                musculo === m.nome && {
                  backgroundColor: m.cor,
                  borderColor: m.cor,
                },
              ]}
              onPress={() => setMusculo(musculo === m.nome ? '' : m.nome)}
            >
              <Text
                style={[
                  styles.musculoTexto,
                  musculo === m.nome && styles.musculoTextoAtivo,
                ]}
              >
                {m.nome}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Equipamento (opcional)</Text>
        <TextInput
          style={styles.input}
          value={equipamento}
          onChangeText={setEquipamento}
          placeholder="Ex: Halteres, Barra, Polia..."
          placeholderTextColor="#555"
        />

        <Text style={styles.label}>Descrição (opcional)</Text>
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          value={descricao}
          onChangeText={setDescricao}
          placeholder="Como executar o exercício..."
          placeholderTextColor="#555"
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity style={styles.botaoSalvar} onPress={handleSalvar}>
          <Ionicons name="checkmark-circle" size={22} color="#fff" />
          <Text style={styles.botaoSalvarTexto}>Criar Exercício</Text>
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
  scroll: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  botaoVoltar: {
    padding: 4,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  label: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#888',
    marginBottom: 8,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: COR_CARD,
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  musculosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  musculoBotao: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COR_CARD,
    borderWidth: 1,
    borderColor: '#333',
  },
  musculoTexto: {
    fontSize: 13,
    color: '#888',
    fontWeight: '600',
  },
  musculoTextoAtivo: {
    color: '#fff',
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
