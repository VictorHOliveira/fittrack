import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

import { carregarPerfil as loadPerfilRemote, carregarHistorico as loadHistoricoRemote } from '../../src/services/firestoreService';
import { carregarPerfil as loadPerfilLocal, carregarHistorico as loadHistoricoLocal, carregarRecordes as loadRecordesLocal, carregarRegistroAgua as loadRegistroAguaLocal, carregarCardio as loadCardioLocal } from '../../src/utils/storage';
import { PerfilUsuario, TreinoCompleto, RecordesMap } from '../../src/types';
import exerciciosData from '../../src/data/exercicios.json';

import CardTreinoConcluido from '../../src/components/compartilhar/CardTreinoConcluido';
import CardComparativo from '../../src/components/compartilhar/CardComparativo';
import CardRecordes from '../../src/components/compartilhar/CardRecordes';
import CardSemanal from '../../src/components/compartilhar/CardSemanal';

const COR_FUNDO = '#1a1a2e';
const COR_CARD = '#16213e';
const COR_PRIMARIA = '#6C63FF';
const { width: SCREEN_W } = Dimensions.get('window');

const exercicioNomeMap: Record<string, string> = {};
exerciciosData.forEach((e: any) => { exercicioNomeMap[e.id] = e.nome; });

interface CardOption {
  id: string;
  titulo: string;
  descricao: string;
  icon: string;
  cor: string;
}

const OPCOES: CardOption[] = [
  { id: 'treino', titulo: 'Treino Concluído', descricao: 'Resumo do treino que você finalizou', icon: 'checkmark-circle', cor: '#4CAF50' },
  { id: 'comparativo', titulo: 'Comparativo', descricao: 'Hoje vs último treino do mesmo nome', icon: 'bar-chart', cor: COR_PRIMARIA },
  { id: 'recordes', titulo: 'Recordes', descricao: 'Recordes batidos nesta sessão', icon: 'trophy', cor: '#FFD700' },
  { id: 'semanal', titulo: 'Resumo da Semana', descricao: 'Treinos, volume, água e cardio da semana', icon: 'calendar', cor: COR_PRIMARIA },
];

function inicioDaSemana(): string {
  const hoje = new Date();
  const dia = hoje.getDay();
  const diff = dia === 0 ? -6 : 1 - dia;
  const segunda = new Date(hoje);
  segunda.setDate(hoje.getDate() + diff);
  return segunda.toISOString().split('T')[0];
}

function getSemanaDias(): string[] {
  const inicio = inicioDaSemana();
  const dias: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(inicio);
    d.setDate(d.getDate() + i);
    dias.push(d.toISOString().split('T')[0]);
  }
  return dias;
}

export default function CompartilharScreen() {
  const { treinoNome, duracao } = useLocalSearchParams<{ treinoNome: string; duracao: string }>();
  const navigation = useNavigation();
  const router = useRouter();

  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [treino, setTreino] = useState<TreinoCompleto | null>(null);
  const [historicoCompleto, setHistorico] = useState<TreinoCompleto[]>([]);
  const [recordes, setRecordes] = useState<RecordesMap>({});
  const [aguaSemana, setAguaSemana] = useState<{ copos: number; ml: number }>({ copos: 0, ml: 0 });
  const [cardioSemana, setCardioSemana] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [compartilhando, setCompartilhando] = useState(false);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [fazerCapture, setFazerCapture] = useState(false);

  const cardRef = useRef<any>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => router.push('/')} style={{ marginRight: 4, padding: 4 }}>
          <Ionicons name="close" size={22} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    (async () => {
      try {
        const [perfilData, historicoData, recordesData, aguaData, cardioData] = await Promise.all([
          loadPerfilLocal(),
          loadHistoricoLocal(),
          loadRecordesLocal(),
          loadRegistroAguaLocal(),
          loadCardioLocal(),
        ]);

        setPerfil(perfilData);
        setHistorico(historicoData);
        setRecordes(recordesData);

        if (historicoData.length > 0) {
          setTreino(historicoData[historicoData.length - 1]);
        }

        const semanaInicio = inicioDaSemana();
        const semanaDias = getSemanaDias();

        const aguaFiltrada = aguaData.filter((r: any) => r.data >= semanaInicio);
        const totalCopos = aguaFiltrada.reduce((acc: number, r: any) => acc + (r.copos?.length || 0), 0);
        const totalMl = aguaFiltrada.reduce((acc: number, r: any) => acc + (r.copos?.reduce((s: number, c: any) => s + (c.ml || 0), 0) || 0), 0);
        setAguaSemana({ copos: totalCopos, ml: totalMl });

        const cardioFiltrado = cardioData.filter((e: any) => e.data >= semanaInicio);
        const totalCardio = cardioFiltrado.reduce((acc: number, e: any) => acc + (e.duracaoMinutos || 0), 0);
        setCardioSemana(totalCardio);
      } finally {
        setCarregando(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!fazerCapture || !selectedCard || !cardRef.current || compartilhando) return;

    (async () => {
      try {
        setCompartilhando(true);
        const uri = await captureRef(cardRef.current, { format: 'png', quality: 0.9 });
        if (!uri) throw new Error('Falha ao capturar');
        if (!(await Sharing.isAvailableAsync())) {
          Alert.alert('Compartilhamento indisponível', 'Seu dispositivo não suporta compartilhamento.');
          return;
        }
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: `Compartilhar - ${OPCOES.find(o => o.id === selectedCard)?.titulo || ''}`,
        });
        router.push('/');
      } catch (e) {
        Alert.alert('Erro', 'Não foi possível compartilhar.');
      } finally {
        setCompartilhando(false);
        setSelectedCard(null);
        setFazerCapture(false);
      }
    })();
  }, [fazerCapture, selectedCard, compartilhando, router]);

  if (carregando) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COR_PRIMARIA} />
      </View>
    );
  }

  const treinoAnterior = historicoCompleto
    .filter(h => h.treino.nome === treinoNome && h.dataExecucao !== treino?.dataExecucao)
    .pop();

  const dadosAtual = treino ? {
    volume: treino.exercicios.reduce((acc, ex) => acc + ex.series.reduce((s, serie) => s + serie.cargas * serie.repeticoes, 0), 0),
    series: treino.exercicios.reduce((acc, ex) => acc + ex.series.length, 0),
    duracao: treino.duracao || Number(duracao) || 0,
  } : { volume: 0, series: 0, duracao: 0 };

  const dadosAnterior = treinoAnterior ? {
    volume: treinoAnterior.exercicios.reduce((acc, ex) => acc + ex.series.reduce((s, serie) => s + serie.cargas * serie.repeticoes, 0), 0),
    series: treinoAnterior.exercicios.reduce((acc, ex) => acc + ex.series.length, 0),
    duracao: treinoAnterior.duracao || 0,
  } : null;

  const comparativoExercicios = treino && treinoAnterior
    ? treino.exercicios.map(ex => {
        const nome = exercicioNomeMap[ex.exercicioId] || ex.exercicioId;
        const volAtual = ex.series.reduce((s, serie) => s + serie.cargas * serie.repeticoes, 0);
        const exAnt = treinoAnterior.exercicios.find(e => e.exercicioId === ex.exercicioId);
        const volAnt = exAnt ? exAnt.series.reduce((s, serie) => s + serie.cargas * serie.repeticoes, 0) : 0;
        return { nome, volumeAtual: volAtual, volumeAnterior: volAnt };
      }).filter(ex => ex.volumeAnterior > 0 || ex.volumeAtual > 0)
    : [];

  const recordesBatidos = treino
    ? treino.exercicios
        .map(ex => {
          const rec = recordes[ex.exercicioId];
          if (!rec) return null;
          const isHoje = rec.data?.startsWith(new Date().toISOString().split('T')[0]);
          if (!isHoje) return null;
          const melhorSerie = ex.series.reduce((best, s) => s.cargas > best.cargas ? s : best, ex.series[0]);
          const cargaAntiga = rec.carga;
          const cargaAntigaMenor = melhorSerie && melhorSerie.cargas > rec.carga ? rec.carga : null;
          if (!cargaAntigaMenor) return null;
          return {
            exercicioNome: exercicioNomeMap[ex.exercicioId] || ex.exercicioId,
            cargaAntiga: rec.carga,
            cargaNova: melhorSerie.cargas,
            repeticoesNovas: melhorSerie.repeticoes,
          };
        })
        .filter(Boolean) as { exercicioNome: string; cargaAntiga: number; cargaNova: number; repeticoesNovas: number }[]
    : [];

  const semanaInicio = inicioDaSemana();
  const semanaDias = getSemanaDias();
  const historicoSemana = historicoCompleto.filter(h => h.dataExecucao.split('T')[0] >= semanaInicio);
  const diasTreinados = semanaDias.map(dia => historicoSemana.some(h => h.dataExecucao.split('T')[0] === dia));
  const totalTreinosSemana = historicoSemana.length;
  const volumeSemana = historicoSemana.reduce((acc, h) => acc + h.exercicios.reduce((a, ex) => a + ex.series.reduce((s, serie) => s + serie.cargas * serie.repeticoes, 0), 0), 0);

  const handleTapCard = (id: string) => {
    if (compartilhando) return;
    setSelectedCard(id);
    setTimeout(() => setFazerCapture(true), 100);
  };

  const exerciciosTreino = treino
    ? treino.exercicios.map(ex => ({
        nome: exercicioNomeMap[ex.exercicioId] || ex.exercicioId,
        volume: ex.series.reduce((s, serie) => s + serie.cargas * serie.repeticoes, 0),
      }))
    : [];

  const cardConteudo: Record<string, React.ReactNode> = {};

  if (treino) {
    cardConteudo.treino = (
      <CardTreinoConcluido
        treinoNome={treinoNome || treino.treino.nome}
        dataExecucao={treino.dataExecucao}
        duracao={duracao || String(treino.duracao || 0)}
        totalVolume={dadosAtual.volume}
        totalSeries={dadosAtual.series}
        totalExercicios={treino.exercicios.length}
        perfilNome={perfil?.nome || 'Atleta'}
        exercicios={exerciciosTreino}
      />
    );

    cardConteudo.comparativo = (
      <CardComparativo
        treinoNome={treinoNome || treino.treino.nome}
        atual={dadosAtual}
        anterior={dadosAnterior}
        comparativoExercicios={comparativoExercicios}
      />
    );

    cardConteudo.recordes = (
      <CardRecordes recordes={recordesBatidos} />
    );
  }

  cardConteudo.semanal = (
    <CardSemanal
      totalTreinos={totalTreinosSemana}
      volumeTotal={volumeSemana}
      aguaCopos={aguaSemana.copos}
      aguaMl={aguaSemana.ml}
      cardioMin={cardioSemana}
      diasTreinados={diasTreinados}
    />
  );

  return (
    <View style={styles.container}>
      {compartilhando && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color={COR_PRIMARIA} />
          <Text style={styles.overlayTexto}>Gerando imagem...</Text>
        </View>
      )}

      {selectedCard && fazerCapture && (
        <View style={styles.captureContainer} pointerEvents="none">
          <View ref={cardRef} collapsable={false}>
            {cardConteudo[selectedCard]}
          </View>
        </View>
      )}

      <Text style={styles.pageTitulo}>Compartilhar</Text>
      <Text style={styles.pageSub}>Escolha o card que você quer compartilhar</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {OPCOES.map((opcao) => (
          <TouchableOpacity
            key={opcao.id}
            style={styles.cardOpcao}
            onPress={() => handleTapCard(opcao.id)}
            activeOpacity={0.7}
            disabled={compartilhando}
          >
            <View style={[styles.opcaoIcon, { backgroundColor: opcao.cor + '20' }]}>
              <Ionicons name={opcao.icon as any} size={36} color={opcao.cor} />
            </View>
            <Text style={styles.opcaoTitulo}>{opcao.titulo}</Text>
            <Text style={styles.opcaoDesc}>{opcao.descricao}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.dica}>
        <Ionicons name="information-circle" size={16} color="#888" />
        <Text style={styles.dicaTexto}>
          O card será gerado como imagem PNG para compartilhar onde quiser
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COR_FUNDO, paddingTop: 8 },
  centered: { flex: 1, backgroundColor: COR_FUNDO, alignItems: 'center', justifyContent: 'center' },
  pageTitulo: { fontSize: 24, fontWeight: 'bold', color: '#fff', paddingHorizontal: 20, marginBottom: 4 },
  pageSub: { fontSize: 13, color: '#888', paddingHorizontal: 20, marginBottom: 20 },
  scrollContent: { paddingHorizontal: 20, gap: 14, paddingBottom: 20 },
  cardOpcao: {
    width: 160, backgroundColor: COR_CARD, borderRadius: 16, padding: 20,
    alignItems: 'center', borderWidth: 1, borderColor: '#333',
  },
  opcaoIcon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  opcaoTitulo: { fontSize: 14, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 6 },
  opcaoDesc: { fontSize: 11, color: '#888', textAlign: 'center', lineHeight: 16 },
  overlay: {
    ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center', justifyContent: 'center', zIndex: 10, gap: 12,
  },
  overlayTexto: { fontSize: 14, color: '#fff' },
  captureContainer: {
    position: 'absolute', left: -9999, top: 0,
  },
  dica: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 20, paddingVertical: 16, marginTop: 'auto',
  },
  dicaTexto: { fontSize: 12, color: '#888', flex: 1 },
});
