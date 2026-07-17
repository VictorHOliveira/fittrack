import { useState, useEffect, useCallback } from 'react';
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
  Image,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import { PerfilUsuario } from '../../src/types';
import {
  salvarPerfil,
  carregarPerfil,
  limparTodosDados,
} from '../../src/services/firestoreService';
import { getAuth, getDb, USERS_COLLECTION } from '../../src/lib/firebase';
import {
  COR_PRIMARIA,
  COR_FUNDO,
  COR_CARD,
  COR_SUCESSO,
} from '../../src/utils/theme';

const NIVEIS = [
  { valor: 'iniciante' as const, label: 'Iniciante', icon: 'leaf' as const },
  {
    valor: 'intermediario' as const,
    label: 'Intermediário',
    icon: 'flame' as const,
  },
  { valor: 'avancado' as const, label: 'Avançado', icon: 'trophy' as const },
];

const OBJETIVOS = [
  'Hipertrofia',
  'Perda de peso',
  'Força',
  'Resistência',
  'Saúde geral',
];
const DIAS_SEMANA = ['1', '2', '3', '4', '5', '6', '7'];

export default function PerfilScreen() {
  const router = useRouter();
  const [perfil, setPerfil] = useState<PerfilUsuario>({
    nome: '',
    idade: '',
    altura: '',
    nivel: 'iniciante',
    objetivo: [],
    diasPorSemana: '4',
  });
  const [salvou, setSalvou] = useState(false);
  const [syncStatus, setSyncStatus] = useState<
    'checking' | 'synced' | 'offline' | 'error'
  >('checking');

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const uid = getAuth().currentUser?.uid;
          if (!uid) {
            setSyncStatus('offline');
            return;
          }
          const doc = await getDb().collection(USERS_COLLECTION).doc(uid).get();
          setSyncStatus(doc.exists() ? 'synced' : 'offline');
        } catch {
          setSyncStatus('error');
        }
      })();
    }, []),
  );

  useEffect(() => {
    (async () => {
      const dados = await carregarPerfil();
      if (dados) {
        setPerfil({
          ...dados,
          objetivo: Array.isArray(dados.objetivo)
            ? dados.objetivo
            : dados.objetivo
              ? [dados.objetivo]
              : [],
        });
      }
    })();
  }, []);

  const handleSalvar = async () => {
    if (!perfil.nome.trim()) {
      Alert.alert('Erro', 'Digite seu nome');
      return;
    }
    await salvarPerfil(perfil);
    setSalvou(true);
    setTimeout(() => setSalvou(false), 2000);
  };

  const getInicial = () => {
    return perfil.nome.trim() ? perfil.nome.trim()[0].toUpperCase() : '?';
  };

  const selecionarFoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Precisamos de acesso à sua galeria para selecionar uma foto.',
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.3,
      base64: true,
    });
    if (!result.canceled && result.assets[0].base64) {
      const uri = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setPerfil({ ...perfil, fotoUri: uri });
    }
  };

  const handleLimparDados = () => {
    Alert.alert(
      'Atenção',
      'Isso vai apagar TODOS os seus dados: treinos, histórico, medidas, cardios, água e exercícios personalizados. Essa ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar Tudo',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirmação Final',
              'Tem certeza absoluta? Todos os dados serão perdidos permanentemente.',
              [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Sim, Apagar',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await limparTodosDados();
                      router.replace('/login');
                    } catch {
                      Alert.alert('Erro', 'Não foi possível apagar os dados');
                    }
                  },
                },
              ],
            );
          },
        },
      ],
    );
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
            onPress={() => router.push('/')}
            style={styles.botaoVoltar}
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.titulo}>Meu Perfil</Text>
        </View>

        <View style={styles.avatarContainer}>
          <TouchableOpacity style={styles.avatar} onPress={selecionarFoto}>
            {perfil.fotoUri ? (
              <Image source={{ uri: perfil.fotoUri }} style={styles.avatarFoto} />
            ) : (
              <Text style={styles.avatarTexto}>{getInicial()}</Text>
            )}
            <View style={styles.cameraIcon}>
              <Ionicons name="camera" size={16} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>
            Toque na foto para alterar
          </Text>
        </View>

        <Text style={styles.label}>Nome</Text>
        <TextInput
          style={styles.input}
          value={perfil.nome}
          onChangeText={(t) => setPerfil({ ...perfil, nome: t })}
          placeholder="Seu nome"
          placeholderTextColor="#555"
        />

        <Text style={styles.label}>Idade</Text>
        <TextInput
          style={styles.input}
          value={perfil.idade}
          onChangeText={(t) => setPerfil({ ...perfil, idade: t })}
          placeholder="Ex: 25"
          placeholderTextColor="#555"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Altura (cm)</Text>
        <TextInput
          style={styles.input}
          value={perfil.altura}
          onChangeText={(t) => setPerfil({ ...perfil, altura: t })}
          placeholder="Ex: 175"
          placeholderTextColor="#555"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Nível de Treino</Text>
        <View style={styles.niveisContainer}>
          {NIVEIS.map((n) => (
            <TouchableOpacity
              key={n.valor}
              style={[
                styles.nivelBotao,
                perfil.nivel === n.valor && styles.nivelBotaoAtivo,
              ]}
              onPress={() => setPerfil({ ...perfil, nivel: n.valor })}
            >
              <Ionicons
                name={n.icon}
                size={20}
                color={perfil.nivel === n.valor ? '#fff' : '#888'}
              />
              <Text
                style={[
                  styles.nivelTexto,
                  perfil.nivel === n.valor && styles.nivelTextoAtivo,
                ]}
              >
                {n.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Objetivo</Text>
        <View style={styles.objetivosContainer}>
          {OBJETIVOS.map((obj) => {
            const ativo = perfil.objetivo.includes(obj);
            return (
              <TouchableOpacity
                key={obj}
                style={[
                  styles.objetivoBotao,
                  ativo && styles.objetivoBotaoAtivo,
                ]}
                onPress={() => {
                  const novo = ativo
                    ? perfil.objetivo.filter((o) => o !== obj)
                    : [...perfil.objetivo, obj];
                  setPerfil({ ...perfil, objetivo: novo });
                }}
              >
                <Text
                  style={[
                    styles.objetivoTexto,
                    ativo && styles.objetivoTextoAtivo,
                  ]}
                >
                  {obj}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>Dias por semana</Text>
        <View style={styles.diasContainer}>
          {DIAS_SEMANA.map((d) => (
            <TouchableOpacity
              key={d}
              style={[
                styles.diaBotao,
                perfil.diasPorSemana === d && styles.diaBotaoAtivo,
              ]}
              onPress={() => setPerfil({ ...perfil, diasPorSemana: d })}
            >
              <Text
                style={[
                  styles.diaTexto,
                  perfil.diasPorSemana === d && styles.diaTextoAtivo,
                ]}
              >
                {d}x
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.botaoSalvar} onPress={handleSalvar}>
          <Ionicons
            name={salvou ? 'checkmark-circle' : 'save-outline'}
            size={22}
            color="#fff"
          />
          <Text style={styles.botaoSalvarTexto}>
            {salvou ? 'Salvo!' : 'Salvar Perfil'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botaoMedidas}
          onPress={() => router.push('/medidas')}
        >
          <Ionicons name="body" size={22} color={COR_PRIMARIA} />
          <View style={styles.botaoMedidasInfo}>
            <Text style={styles.botaoMedidasTexto}>Medidas Corporais</Text>
            <Text style={styles.botaoMedidasSub}>
              Acompanhe peso, cintura, braço e mais
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>

        <View style={styles.syncContainer}>
          <View style={styles.syncRow}>
            <Ionicons
              name={
                syncStatus === 'synced'
                  ? 'cloud-done'
                  : syncStatus === 'checking'
                    ? 'cloud-outline'
                    : 'cloud-offline'
              }
              size={16}
              color={
                syncStatus === 'synced'
                  ? COR_SUCESSO
                  : syncStatus === 'checking'
                    ? '#888'
                    : '#ff6b6b'
              }
            />
            <Text style={styles.syncTexto}>
              {syncStatus === 'synced'
                ? 'Sincronizado com a nuvem'
                : syncStatus === 'checking'
                  ? 'Verificando conexão...'
                  : syncStatus === 'offline'
                    ? 'Modo offline'
                    : 'Erro de conexão'}
            </Text>
          </View>
          {syncStatus === 'offline' && (
            <TouchableOpacity
              style={styles.syncBotao}
              onPress={async () => {
                try {
                  const { checkAndMigrate } =
                    await import('../../src/services/syncFirestore');
                  const uid = getAuth().currentUser?.uid;
                  if (uid) {
                    await checkAndMigrate(uid);
                    setSyncStatus('synced');
                    Alert.alert('Sucesso', 'Dados sincronizados com a nuvem!');
                  }
                } catch {
                  Alert.alert('Erro', 'Não foi possível sincronizar');
                }
              }}
            >
              <Ionicons name="sync-outline" size={14} color="#fff" />
              <Text style={styles.syncBotaoTexto}>Sincronizar Agora</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.botaoLimpar}
          onPress={handleLimparDados}
        >
          <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
          <Text style={styles.botaoLimparTexto}>Limpar Todos os Dados</Text>
        </TouchableOpacity>

        <Text style={styles.versao}>
          v{Constants.expoConfig?.version || '1.0.0'}
        </Text>
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
    marginBottom: 20,
  },
  botaoVoltar: {
    padding: 4,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COR_PRIMARIA,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  avatarFoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarTexto: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COR_PRIMARIA,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COR_FUNDO,
  },
  avatarHint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
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
    backgroundColor: COR_CARD,
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  linha: {
    flexDirection: 'row',
    gap: 12,
  },
  coluna: {
    flex: 1,
  },
  niveisContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  nivelBotao: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COR_CARD,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#333',
  },
  nivelBotaoAtivo: {
    backgroundColor: COR_PRIMARIA,
    borderColor: COR_PRIMARIA,
  },
  nivelTexto: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
  },
  nivelTextoAtivo: {
    color: '#fff',
  },
  objetivosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  objetivoBotao: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COR_CARD,
    borderWidth: 1,
    borderColor: '#333',
  },
  objetivoBotaoAtivo: {
    backgroundColor: COR_PRIMARIA,
    borderColor: COR_PRIMARIA,
  },
  objetivoTexto: {
    fontSize: 13,
    color: '#888',
    fontWeight: '600',
  },
  objetivoTextoAtivo: {
    color: '#fff',
  },
  diasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 30,
  },
  diaBotao: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
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
    fontSize: 16,
    color: '#888',
    fontWeight: 'bold',
  },
  diaTextoAtivo: {
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
  },
  botaoSalvarTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  botaoMedidas: {
    backgroundColor: COR_CARD,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  botaoMedidasInfo: {
    flex: 1,
  },
  botaoMedidasTexto: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },
  botaoMedidasSub: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  syncContainer: {
    marginTop: 24,
    backgroundColor: COR_CARD,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  syncTexto: {
    fontSize: 13,
    color: '#888',
    flex: 1,
  },
  syncBotao: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COR_PRIMARIA,
    borderRadius: 8,
    paddingVertical: 10,
  },
  syncBotaoTexto: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
  versao: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
    marginTop: 24,
  },
  botaoLimpar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 30,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ff6b6b44',
    backgroundColor: '#ff6b6b11',
  },
  botaoLimparTexto: {
    fontSize: 14,
    color: '#ff6b6b',
    fontWeight: 'bold',
  },
});
