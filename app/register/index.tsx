import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { COR_PRIMARIA, COR_FUNDO, COR_CARD } from '../../src/utils/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [loading, setLoading] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  async function handleRegister() {
    if (!email.trim() || !senha.trim()) {
      Alert.alert('Erro', 'Preencha email e senha.');
      return;
    }
    if (senha.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (senha !== confirmar) {
      Alert.alert('Erro', 'As senhas não conferem.');
      return;
    }
    setLoading(true);
    try {
      await register(email.trim(), senha);
      router.replace('/(tabs)');
    } catch (e: any) {
      const msg =
        e.code === 'auth/email-already-in-use'
          ? 'Este email já está cadastrado.'
          : e.code === 'auth/invalid-email'
            ? 'Email inválido.'
            : 'Erro ao cadastrar. Tente novamente.';
      Alert.alert('Erro', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <Ionicons name="fitness" size={64} color={COR_PRIMARIA} />
        <Text style={styles.titulo}>Criar Conta</Text>
        <Text style={styles.subtitulo}>Cadastre-se para salvar seus dados</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="seu@email.com"
            placeholderTextColor="#555"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Senha</Text>
          <View style={styles.senhaRow}>
            <TextInput
              style={styles.inputSenha}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor="#555"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry={!mostrarSenha}
              editable={!loading}
            />
            <TouchableOpacity
              onPress={() => setMostrarSenha(!mostrarSenha)}
              style={styles.olho}
            >
              <Ionicons
                name={mostrarSenha ? 'eye-off' : 'eye'}
                size={22}
                color="#888"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirmar Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Repita a senha"
            placeholderTextColor="#555"
            value={confirmar}
            onChangeText={setConfirmar}
            secureTextEntry={!mostrarSenha}
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          style={[styles.botao, loading && styles.botaoDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botaoTexto}>Cadastrar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.link}
          onPress={() => router.push('/login')}
          disabled={loading}
        >
          <Text style={styles.linkTexto}>
            Já tem conta? <Text style={styles.linkDestaque}>Faça login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COR_FUNDO,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  titulo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
  },
  subtitulo: {
    fontSize: 15,
    color: '#888',
    marginBottom: 32,
    marginTop: 8,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    color: '#aaa',
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    backgroundColor: COR_CARD,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
  },
  senhaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COR_CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  inputSenha: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#fff',
  },
  olho: {
    padding: 16,
  },
  botao: {
    backgroundColor: COR_PRIMARIA,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    width: '100%',
    marginTop: 12,
  },
  botaoDisabled: {
    opacity: 0.6,
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 24,
  },
  linkTexto: {
    color: '#888',
    fontSize: 14,
  },
  linkDestaque: {
    color: COR_PRIMARIA,
    fontWeight: '600',
  },
});
