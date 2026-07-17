import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import {
  carregarPerfil,
  carregarHistorico,
} from '../../src/services/firestoreService';
import { PerfilUsuario, TreinoCompleto } from '../../src/types';
import { COR_FUNDO, COR_CARD, COR_PRIMARIA } from '../../src/utils/theme';
import { useExercicios } from '../../src/hooks/useExercicios';
import { formatarDuracao, formatarDataLonga } from '../../src/utils/format';
import {
  calcularVolumeExercicio,
  calcularSeriesExercicio,
} from '../../src/utils/stats';

export default function ResumoTreinoScreen() {
  const { treinoNome, duracao, recordesBatidos } = useLocalSearchParams<{
    treinoNome: string;
    duracao: string;
    recordesBatidos?: string;
  }>();

  const navigation = useNavigation();
  const router = useRouter();
  const scrollRef = useRef<any>(null);
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [treino, setTreino] = useState<TreinoCompleto | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [compartilhando, setCompartilhando] = useState(false);
  const { getNome } = useExercicios();

  useEffect(() => {
    (async () => {
      try {
        const [dadosPerfil, historico] = await Promise.all([
          carregarPerfil(),
          carregarHistorico(),
        ]);
        setPerfil(dadosPerfil);
        if (historico.length > 0) {
          setTreino(historico[0]);
        }
      } finally {
        setCarregando(false);
      }
    })();
  }, []);

  const handleShare = async () => {
    if (compartilhando) return;
    try {
      setCompartilhando(true);
      const uri = await captureRef(scrollRef.current, {
        format: 'png',
        quality: 0.9,
      });
      if (!uri) throw new Error('Falha ao capturar');
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert(
          'Compartilhamento indisponível',
          'Seu dispositivo não suporta compartilhamento.',
        );
        return;
      }
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Compartilhar Treino',
      });
      router.push('/');
    } catch {
      Alert.alert('Erro', 'Não foi possível compartilhar o treino.');
    } finally {
      setCompartilhando(false);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={handleShare}
          style={styles.headerBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="share-outline" size={22} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, compartilhando]);

  if (carregando) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COR_PRIMARIA} />
      </View>
    );
  }

  const exercicios = treino?.exercicios || [];
  const totalSeries = calcularSeriesExercicio(exercicios);
  const totalExercicios = exercicios.length;
  const volumeTotal = calcularVolumeExercicio(exercicios);

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.concluidoSection}>
        <View style={styles.checkIcon}>
          <Ionicons name="checkmark-circle" size={48} color="#4CAF50" />
        </View>
        <Text style={styles.concluidoLabel}>TREINO CONCLUÍDO</Text>
        <Text style={styles.nomeUsuario}>{perfil?.nome || 'Atleta'}</Text>
        <Text style={styles.meta}>
          {formatarDataLonga(new Date().toISOString())} •{' '}
          {formatarDuracao(Number(duracao))}
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="barbell" size={22} color={COR_PRIMARIA} />
          <Text style={styles.statNumero}>{volumeTotal} kg</Text>
          <Text style={styles.statLabel}>Volume</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="layers" size={22} color={COR_PRIMARIA} />
          <Text style={styles.statNumero}>{totalSeries} sets</Text>
          <Text style={styles.statLabel}>Séries</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="fitness" size={22} color={COR_PRIMARIA} />
          <Text style={styles.statNumero}>{totalExercicios} mov</Text>
          <Text style={styles.statLabel}>Exercícios</Text>
        </View>
      </View>

      <View style={styles.exerciciosSection}>
        <Text style={styles.sectionTitulo}>EXERCÍCIOS REALIZADOS</Text>

        {exercicios.map((ex, i) => {
          const nome = getNome(ex.exercicioId) || ex.exercicioId;
          const volumeEx = ex.series.reduce(
            (s, serie) => s + serie.cargas * serie.repeticoes,
            0,
          );
          return (
            <View key={i} style={styles.exRow}>
              <Text style={styles.exNome} numberOfLines={1}>
                {nome}
              </Text>
              <Text style={styles.exVolume}>{volumeEx} kg</Text>
            </View>
          );
        })}
      </View>

      <TouchableOpacity
        style={styles.botaoGaleria}
        onPress={() =>
          router.push({
            pathname: '/compartilhar',
            params: {
              treinoNome: treinoNome || '',
              duracao: duracao || '0',
              recordesBatidos: recordesBatidos || '',
            },
          })
        }
        activeOpacity={0.7}
      >
        <Ionicons name="images-outline" size={20} color={COR_PRIMARIA} />
        <Text style={styles.botaoGaleriaTexto}>Criar Card Personalizado</Text>
        <Ionicons name="chevron-forward" size={18} color={COR_PRIMARIA} />
      </TouchableOpacity>

      <View style={styles.branding}>
        <Ionicons name="fitness" size={18} color={COR_PRIMARIA} />
        <Text style={styles.brandingTexto}>TREINO MAIS</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COR_FUNDO,
  },
  centered: {
    flex: 1,
    backgroundColor: COR_FUNDO,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  concluidoSection: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  checkIcon: {
    marginBottom: 12,
  },
  concluidoLabel: {
    fontSize: 13,
    color: '#888',
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 8,
  },
  nomeUsuario: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  meta: {
    fontSize: 13,
    color: '#888',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: COR_CARD,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#333',
  },
  statNumero: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 11,
    color: '#888',
    fontWeight: '600',
  },
  exerciciosSection: {
    marginBottom: 24,
  },
  sectionTitulo: {
    fontSize: 13,
    color: '#888',
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 12,
  },
  exRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COR_CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 8,
  },
  exNome: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
    flex: 1,
    marginRight: 12,
  },
  exVolume: {
    fontSize: 14,
    color: COR_PRIMARIA,
    fontWeight: 'bold',
  },
  botaoGaleria: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COR_CARD,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COR_PRIMARIA + '40',
  },
  botaoGaleriaTexto: {
    fontSize: 14,
    color: COR_PRIMARIA,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  branding: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 16,
    opacity: 0.5,
  },
  brandingTexto: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  headerBtn: {
    marginRight: 4,
    padding: 4,
  },
});
