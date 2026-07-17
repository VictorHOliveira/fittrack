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
  carregarPerfil as loadPerfilLocal,
  carregarHistorico as loadHistoricoLocal,
  carregarRecordes as loadRecordesLocal,
  carregarRegistroAgua as loadRegistroAguaLocal,
  carregarCardio as loadCardioLocal,
} from '../../src/utils/storage';
import { PerfilUsuario, TreinoCompleto, RecordesMap } from '../../src/types';
import { COR_FUNDO, COR_CARD, COR_PRIMARIA } from '../../src/utils/theme';
import { useExercicios } from '../../src/hooks/useExercicios';
import {
  calcularVolumeExercicio,
  calcularVolumeTreino,
  calcularSeriesExercicio,
  inicioDaSemana,
  getSemanaDias,
} from '../../src/utils/stats';

import CardTreinoConcluido from '../../src/components/compartilhar/CardTreinoConcluido';
import CardComparativo from '../../src/components/compartilhar/CardComparativo';
import CardRecordes from '../../src/components/compartilhar/CardRecordes';
import CardSemanal from '../../src/components/compartilhar/CardSemanal';

interface CardOption {
  id: string;
  titulo: string;
  descricao: string;
  icon: string;
  cor: string;
}

const OPCOES: CardOption[] = [
  {
    id: 'treino',
    titulo: 'Treino Concluído',
    descricao: 'Resumo do treino que você finalizou',
    icon: 'checkmark-circle',
    cor: '#4CAF50',
  },
  {
    id: 'comparativo',
    titulo: 'Comparativo',
    descricao: 'Hoje vs último treino do mesmo nome',
    icon: 'bar-chart',
    cor: COR_PRIMARIA,
  },
  {
    id: 'recordes',
    titulo: 'Recordes',
    descricao: 'Recordes batidos nesta sessão',
    icon: 'trophy',
    cor: '#FFD700',
  },
  {
    id: 'semanal',
    titulo: 'Resumo da Semana',
    descricao: 'Treinos, volume, água e cardio da semana',
    icon: 'calendar',
    cor: COR_PRIMARIA,
  },
];

export default function CompartilharScreen() {
  const { treinoNome, duracao, recordesBatidos: recordesBatidosParam } = useLocalSearchParams<{
    treinoNome: string;
    duracao: string;
    recordesBatidos?: string;
  }>();
  const navigation = useNavigation();
  const router = useRouter();

  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [treino, setTreino] = useState<TreinoCompleto | null>(null);
  const [historicoCompleto, setHistorico] = useState<TreinoCompleto[]>([]);
  const [recordes, setRecordes] = useState<RecordesMap>({});
  const [aguaSemana, setAguaSemana] = useState<{ copos: number; ml: number }>({
    copos: 0,
    ml: 0,
  });
  const [cardioSemana, setCardioSemana] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [compartilhando, setCompartilhando] = useState(false);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [fazerCapture, setFazerCapture] = useState(false);
  const { getNome } = useExercicios();

  const recordesBatidosNav = recordesBatidosParam
    ? (JSON.parse(recordesBatidosParam) as Record<string, { cargaAntiga: number; cargaNova: number; repeticoes: number }>)
    : null;

  const cardRef = useRef<any>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => router.push('/')}
          style={{ marginRight: 4, padding: 4 }}
        >
          <Ionicons name="close" size={22} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    (async () => {
      try {
        const [perfilData, historicoData, recordesData, aguaData, cardioData] =
          await Promise.all([
            loadPerfilLocal(),
            loadHistoricoLocal(),
            loadRecordesLocal(),
            loadRegistroAguaLocal(),
            loadCardioLocal(),
          ]);

        setPerfil(perfilData);
        setRecordes(recordesData);

        const ordenado = [...historicoData].sort(
          (a, b) =>
            new Date(b.dataExecucao).getTime() -
            new Date(a.dataExecucao).getTime(),
        );
        setHistorico(ordenado);

        if (ordenado.length > 0) {
          setTreino(ordenado[0]);
        }

        const semanaInicio = inicioDaSemana();

        const aguaFiltrada = aguaData.filter(
          (r: any) => r.data >= semanaInicio,
        );
        const totalCopos = aguaFiltrada.reduce(
          (acc: number, r: any) => acc + (r.copos?.length || 0),
          0,
        );
        const totalMl = aguaFiltrada.reduce(
          (acc: number, r: any) =>
            acc +
            (r.copos?.reduce((s: number, c: any) => s + (c.ml || 0), 0) || 0),
          0,
        );
        setAguaSemana({ copos: totalCopos, ml: totalMl });

        const cardioFiltrado = cardioData.filter(
          (e: any) => e.data >= semanaInicio,
        );
        const totalCardio = cardioFiltrado.reduce(
          (acc: number, e: any) => acc + (e.duracaoMinutos || 0),
          0,
        );
        setCardioSemana(totalCardio);
      } finally {
        setCarregando(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!fazerCapture || !selectedCard || !cardRef.current || compartilhando)
      return;

    (async () => {
      try {
        setCompartilhando(true);
        const uri = await captureRef(cardRef.current, {
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
          dialogTitle: `Compartilhar - ${OPCOES.find((o) => o.id === selectedCard)?.titulo || ''}`,
        });
      } catch {
        Alert.alert('Erro', 'Não foi possível compartilhar.');
      } finally {
        setCompartilhando(false);
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

  const treinoAnterior =
    historicoCompleto
      .filter(
        (h) =>
          h.treino.nome === treinoNome &&
          h.dataExecucao !== treino?.dataExecucao,
      )
      .sort(
        (a, b) =>
          new Date(b.dataExecucao).getTime() -
          new Date(a.dataExecucao).getTime(),
      )[0] || null;

  const dadosAtual = treino
    ? {
        volume: calcularVolumeExercicio(treino.exercicios),
        series: calcularSeriesExercicio(treino.exercicios),
        duracao: treino.duracao || Number(duracao) || 0,
      }
    : { volume: 0, series: 0, duracao: 0 };

  const dadosAnterior = treinoAnterior
    ? {
        volume: calcularVolumeExercicio(treinoAnterior.exercicios),
        series: calcularSeriesExercicio(treinoAnterior.exercicios),
        duracao: treinoAnterior.duracao || 0,
      }
    : null;

  const comparativoExercicios =
    treino && treinoAnterior
      ? treino.exercicios
          .map((ex) => {
            const nome = getNome(ex.exercicioId) || ex.exercicioId;
            const volAtual = ex.series.reduce(
              (s, serie) => s + serie.cargas * serie.repeticoes,
              0,
            );
            const exAnt = treinoAnterior.exercicios.find(
              (e) => e.exercicioId === ex.exercicioId,
            );
            const volAnt = exAnt
              ? exAnt.series.reduce(
                  (s, serie) => s + serie.cargas * serie.repeticoes,
                  0,
                )
              : 0;
            return { nome, volumeAtual: volAtual, volumeAnterior: volAnt };
          })
          .filter((ex) => ex.volumeAnterior > 0 || ex.volumeAtual > 0)
      : [];

  const recordesBatidos =
    recordesBatidosNav && treino
      ? (treino.exercicios
          .map((ex) => {
            const detalhe = recordesBatidosNav[ex.exercicioId];
            if (!detalhe) return null;
            return {
              exercicioNome: getNome(ex.exercicioId) || ex.exercicioId,
              cargaAntiga: detalhe.cargaAntiga,
              cargaNova: detalhe.cargaNova,
              repeticoesNovas: detalhe.repeticoes,
            };
          })
          .filter(Boolean) as {
          exercicioNome: string;
          cargaAntiga: number;
          cargaNova: number;
          repeticoesNovas: number;
        }[])
      : treino
        ? (treino.exercicios
            .map((ex) => {
              const rec = recordes[ex.exercicioId];
              if (!rec) return null;
              const isHoje = rec.data?.startsWith(
                new Date().toISOString().split('T')[0],
              );
              if (!isHoje) return null;
              const melhorSerie = ex.series.reduce(
                (best, s) => (s.cargas > best.cargas ? s : best),
                ex.series[0],
              );
              const cargaAntigaMenor =
                melhorSerie && melhorSerie.cargas > rec.carga ? rec.carga : null;
              if (!cargaAntigaMenor) return null;
              return {
                exercicioNome: getNome(ex.exercicioId) || ex.exercicioId,
                cargaAntiga: rec.carga,
                cargaNova: melhorSerie.cargas,
                repeticoesNovas: melhorSerie.repeticoes,
              };
            })
            .filter(Boolean) as {
            exercicioNome: string;
            cargaAntiga: number;
            cargaNova: number;
            repeticoesNovas: number;
          }[])
        : [];

  const semanaInicio = inicioDaSemana();
  const semanaDias = getSemanaDias();
  const historicoSemana = historicoCompleto.filter(
    (h) => h.dataExecucao.split('T')[0] >= semanaInicio,
  );
  const diasTreinados = semanaDias.map((dia) =>
    historicoSemana.some((h) => h.dataExecucao.split('T')[0] === dia),
  );
  const totalTreinosSemana = historicoSemana.length;
  const volumeSemana = historicoSemana.reduce(
    (acc, h) => acc + calcularVolumeTreino(h),
    0,
  );

  const handleTapCard = (id: string) => {
    if (compartilhando) return;
    setSelectedCard(selectedCard === id ? null : id);
  };

  const handleCompartilhar = () => {
    if (!selectedCard || compartilhando) return;
    setFazerCapture(true);
  };

  const exerciciosTreino = treino
    ? treino.exercicios.map((ex) => ({
        nome: getNome(ex.exercicioId) || ex.exercicioId,
        volume: ex.series.reduce(
          (s, serie) => s + serie.cargas * serie.repeticoes,
          0,
        ),
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

    cardConteudo.recordes = <CardRecordes recordes={recordesBatidos} />;
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

      <ScrollView
        contentContainerStyle={styles.mainScroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitulo}>Compartilhar</Text>
        <Text style={styles.pageSub}>
          Escolha o card que você quer compartilhar
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {OPCOES.map((opcao) => (
            <TouchableOpacity
              key={opcao.id}
              style={[
                styles.cardOpcao,
                selectedCard === opcao.id && styles.cardOpcaoSelecionado,
              ]}
              onPress={() => handleTapCard(opcao.id)}
              activeOpacity={0.7}
              disabled={compartilhando}
            >
              <View
                style={[
                  styles.opcaoIcon,
                  { backgroundColor: opcao.cor + '20' },
                ]}
              >
                <Ionicons
                  name={opcao.icon as any}
                  size={36}
                  color={opcao.cor}
                />
              </View>
              <Text style={styles.opcaoTitulo}>{opcao.titulo}</Text>
              <Text style={styles.opcaoDesc}>{opcao.descricao}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {selectedCard && (
          <View style={styles.previewSection}>
            <View ref={cardRef} collapsable={false}>
              {cardConteudo[selectedCard]}
            </View>
            <TouchableOpacity
              style={styles.botaoCompartilhar}
              onPress={handleCompartilhar}
              disabled={compartilhando}
              activeOpacity={0.7}
            >
              <Ionicons name="share-outline" size={20} color="#fff" />
              <Text style={styles.botaoCompartilharTexto}>Compartilhar</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COR_FUNDO, paddingTop: 8 },
  centered: {
    flex: 1,
    backgroundColor: COR_FUNDO,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainScroll: { paddingBottom: 20 },
  pageTitulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  pageSub: {
    fontSize: 13,
    color: '#888',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  scrollContent: { paddingHorizontal: 20, gap: 14, paddingBottom: 20 },
  cardOpcao: {
    width: 160,
    backgroundColor: COR_CARD,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  cardOpcaoSelecionado: {
    borderColor: COR_PRIMARIA,
    borderWidth: 2,
  },
  opcaoIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  opcaoTitulo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 6,
  },
  opcaoDesc: {
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
    lineHeight: 16,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    gap: 12,
  },
  overlayTexto: { fontSize: 14, color: '#fff' },
  previewSection: {
    marginTop: 4,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  botaoCompartilhar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COR_PRIMARIA,
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
    width: '100%',
  },
  botaoCompartilharTexto: { fontSize: 15, color: '#fff', fontWeight: 'bold' },
});
