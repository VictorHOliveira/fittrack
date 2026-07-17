import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAgua } from '../../src/hooks/useAgua';
import { ConfigAgua } from '../../src/types';
import {
  COR_PRIMARIA,
  COR_FUNDO,
  COR_CARD,
  COR_SUCESSO,
} from '../../src/utils/theme';

export default function ConfigAguaScreen() {
  const router = useRouter();
  const { config, salvarConfig } = useAgua();
  const [form, setForm] = useState<ConfigAgua>(config);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm(config);
  }, [config]);

  const handleSalvar = async () => {
    const intervalo = Number(form.intervaloMinutos);
    const copoMl = Number(form.copoMl);
    const metaDiaria = Number(form.metaDiaria);

    if (!intervalo || intervalo < 1) {
      Alert.alert('Erro', 'Intervalo deve ser no mínimo 1 minuto');
      return;
    }
    if (!copoMl || copoMl < 50) {
      Alert.alert('Erro', 'Tamanho do copo deve ser no mínimo 50ml');
      return;
    }
    if (!metaDiaria || metaDiaria < 1) {
      Alert.alert('Erro', 'Meta diária deve ser no mínimo 1 copo');
      return;
    }

    try {
      await salvarConfig({
        notificacaoAtivada: form.notificacaoAtivada,
        intervaloMinutos: intervalo,
        copoMl,
        metaDiaria,
      });
      router.back();
    } catch (e: any) {
      Alert.alert(
        'Erro ao salvar',
        e?.message || 'Ocorreu um erro ao salvar as configurações de água.',
      );
    }
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
          Configure seus lembretes e metas de hidratação.
        </Text>

        <View style={styles.card}>
          <View style={styles.switchLinha}>
            <View style={styles.switchInfo}>
              <Ionicons name="notifications" size={20} color={COR_PRIMARIA} />
              <Text style={styles.switchLabel}>Notificações</Text>
            </View>
            <Switch
              value={form.notificacaoAtivada}
              onValueChange={(v) => setForm({ ...form, notificacaoAtivada: v })}
              trackColor={{ false: '#333', true: COR_PRIMARIA + '60' }}
              thumbColor={form.notificacaoAtivada ? COR_PRIMARIA : '#888'}
            />
          </View>
          <Text style={styles.switchHint}>
            Receba lembretes periódicos para beber água
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Intervalo entre lembretes (minutos)</Text>
          <TextInput
            style={styles.input}
            value={String(form.intervaloMinutos)}
            onChangeText={(t) =>
              setForm({ ...form, intervaloMinutos: Number(t) || 0 })
            }
            keyboardType="number-pad"
            placeholder="60"
            placeholderTextColor="#555"
            editable={form.notificacaoAtivada}
          />
          <Text style={styles.hint}>
            A cada quantos minutos você quer ser lembrado?
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Tamanho do copo (ml)</Text>
          <TextInput
            style={styles.input}
            value={String(form.copoMl)}
            onChangeText={(t) => setForm({ ...form, copoMl: Number(t) || 0 })}
            keyboardType="number-pad"
            placeholder="250"
            placeholderTextColor="#555"
          />
          <Text style={styles.hint}>Quantos ml tem seu copo ou garrafa?</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Meta diária (copos)</Text>
          <TextInput
            style={styles.input}
            value={String(form.metaDiaria)}
            onChangeText={(t) =>
              setForm({ ...form, metaDiaria: Number(t) || 0 })
            }
            keyboardType="number-pad"
            placeholder="8"
            placeholderTextColor="#555"
          />
          <Text style={styles.hint}>
            Quantos copos você quer tomar por dia?
          </Text>
        </View>

        <View style={styles.resumo}>
          <Ionicons name="water" size={18} color={COR_AGUA} />
          <Text style={styles.resumoTexto}>
            Meta: {form.metaDiaria * (form.copoMl || 250)}ml/dia
          </Text>
        </View>

        <TouchableOpacity style={styles.botaoSalvar} onPress={handleSalvar}>
          <Ionicons name="checkmark-circle" size={22} color="#fff" />
          <Text style={styles.botaoSalvarTexto}>Salvar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const COR_AGUA = '#00BFFF';

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
  card: {
    backgroundColor: COR_CARD,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  switchLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },
  switchHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#888',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: COR_FUNDO,
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  hint: {
    fontSize: 12,
    color: '#555',
    marginTop: 6,
  },
  resumo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 20,
    padding: 12,
    backgroundColor: COR_CARD,
    borderRadius: 12,
  },
  resumoTexto: {
    fontSize: 14,
    color: '#aaa',
    fontWeight: '600',
  },
  botaoSalvar: {
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
