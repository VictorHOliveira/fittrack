import { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTreinos, useHistorico } from '../../src/hooks/useTreinos';
import {
  carregarPerfil,
  carregarPerfilLocal,
} from '../../src/services/firestoreService';
import { PerfilUsuario } from '../../src/types';
import {
  carregarTreinoEmAndamento,
  TreinoEmAndamento,
  formatarDuracao,
} from '../../src/utils/storage';
import PainelAgua from '../../src/components/agua/PainelAgua';
import PainelCardio from '../../src/components/cardio/PainelCardio';
import {
  COR_PRIMARIA,
  COR_FUNDO,
  COR_CARD,
  COR_SUCESSO,
} from '../../src/utils/theme';

function getMsgHorario(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

function normalizarPerfil(p: PerfilUsuario): PerfilUsuario {
  return {
    ...p,
    nivel: p.nivel || 'iniciante',
    objetivo: Array.isArray(p.objetivo)
      ? p.objetivo
      : p.objetivo
        ? [p.objetivo]
        : [],
  };
}

export default function HomeScreen() {
  const router = useRouter();
  const { treinos } = useTreinos();
  const { historico } = useHistorico();
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [treinoEmAndamento, setTreinoEmAndamento] =
    useState<TreinoEmAndamento | null>(null);
  const [tempoAndamento, setTempoAndamento] = useState(0);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const local = await carregarPerfilLocal();
        setPerfil(local ? normalizarPerfil(local) : null);

        const remote = await carregarPerfil();
        if (JSON.stringify(local) !== JSON.stringify(remote))
          setPerfil(remote ? normalizarPerfil(remote) : null);

        const emAndamento = await carregarTreinoEmAndamento();
        setTreinoEmAndamento(emAndamento);
        if (emAndamento) {
          setTempoAndamento(
            Math.floor((Date.now() - emAndamento.tempoInicio) / 1000),
          );
        }
      })();
    }, []),
  );

  useEffect(() => {
    if (!treinoEmAndamento) return;
    const interval = setInterval(() => {
      setTempoAndamento(
        Math.floor((Date.now() - treinoEmAndamento.tempoInicio) / 1000),
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [treinoEmAndamento]);

  const diasSeguidos = historico.length >= 3;

  const nomeUsuario = perfil?.nome?.trim() || 'Atleta';
  const nomeTreinoAndamento = treinoEmAndamento
    ? treinos.find((t) => t.id === treinoEmAndamento.treinoId)?.nome || 'Treino'
    : '';
  const exerciciosConcluidos = treinoEmAndamento
    ? treinoEmAndamento.exerciciosExecucao.filter((ex: any) =>
        ex.series.some((s: any) => s.concluida),
      ).length
    : 0;
  const totalExercicios = treinoEmAndamento?.exerciciosExecucao.length || 0;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.greetingSection}>
          <Text style={styles.greeting}>{getMsgHorario()}, </Text>
          <Text style={styles.nome}>{nomeUsuario}</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            onPress={() => router.push('/perfil')}
            style={styles.headerIcon}
          >
            <Ionicons name="person-circle" size={36} color={COR_PRIMARIA} />
          </TouchableOpacity>
        </View>
      </View>

      {perfil && (
        <View style={styles.perfilBadge}>
          <Ionicons name="fitness" size={14} color={COR_PRIMARIA} />
          <Text style={styles.perfilBadgeTexto}>
            {perfil.nivel.charAt(0).toUpperCase() + perfil.nivel.slice(1)} •{' '}
            {perfil.objetivo?.join(', ') || 'Treino'}
          </Text>
        </View>
      )}

      <View style={styles.stats}>
        <TouchableOpacity
          style={styles.statCard}
          onPress={() => router.push('/treinos')}
          activeOpacity={0.7}
        >
          <Ionicons name="barbell" size={26} color={COR_PRIMARIA} />
          <Text style={styles.statNumero}>{treinos.length}</Text>
          <Text style={styles.statLabel}>Treinos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.statCard}
          onPress={() => router.push('/concluidos')}
          activeOpacity={0.7}
        >
          <Ionicons name="checkmark-circle" size={26} color={COR_SUCESSO} />
          <Text style={styles.statNumero}>{historico.length}</Text>
          <Text style={styles.statLabel}>Concluídos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.statCard}
          onPress={() => router.push('/historico')}
          activeOpacity={0.7}
        >
          <Ionicons name="time" size={26} color={COR_PRIMARIA} />
          <Text style={styles.statNumero}>{historico.length}</Text>
          <Text style={styles.statLabel}>Histórico</Text>
        </TouchableOpacity>
      </View>

      {diasSeguidos && (
        <View style={styles.badgeConquista}>
          <Ionicons name="trophy" size={18} color="#FFD700" />
          <Text style={styles.badgeTexto}>
            Parabéns! Você treinou 3+ vezes essa semana!
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.botaoPrincipal}
        onPress={() => router.push('/criar-treino')}
      >
        <Ionicons name="add-circle" size={24} color="#fff" />
        <Text style={styles.botaoTexto}>Criar Novo Treino</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.botaoSecundario}
        onPress={() => router.push('/exercicios')}
      >
        <Ionicons name="fitness" size={24} color={COR_PRIMARIA} />
        <Text style={styles.botaoSecundarioTexto}>Ver Exercícios</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.botaoSecundario}
        onPress={() => router.push('/iniciar-treino')}
      >
        <Ionicons name="play-circle" size={24} color={COR_SUCESSO} />
        <Text style={styles.botaoSecundarioTexto}>Iniciar Treino de Hoje</Text>
      </TouchableOpacity>

      <PainelAgua />

      <PainelCardio />

      {treinoEmAndamento && (
        <View style={styles.painelFlutuante}>
          <TouchableOpacity
            style={styles.painelFlutuanteTouch}
            activeOpacity={0.8}
            onPress={() =>
              router.push({
                pathname: '/treino/executar/[id]',
                params: { id: treinoEmAndamento.treinoId },
              })
            }
          >
            <View style={styles.painelIconeContainer}>
              <Ionicons name="timer" size={20} color="#ff9800" />
            </View>
            <View style={styles.painelInfo}>
              <Text style={styles.painelTitulo}>Treino em Andamento</Text>
              <Text style={styles.painelSubtitulo}>
                {nomeTreinoAndamento} • {exerciciosConcluidos}/{totalExercicios}{' '}
                exercícios
              </Text>
            </View>
            <View style={styles.painelDireita}>
              <Text style={styles.painelTempo}>
                {formatarDuracao(tempoAndamento)}
              </Text>
              <Ionicons name="play" size={18} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COR_FUNDO,
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  greetingSection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flexShrink: 1,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    padding: 4,
  },
  greeting: {
    fontSize: 22,
    color: '#fff',
  },
  nome: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  perfilBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: COR_PRIMARIA + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 24,
    marginTop: 8,
  },
  perfilBadgeTexto: {
    fontSize: 12,
    color: COR_PRIMARIA,
    fontWeight: '600',
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: COR_CARD,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#333',
  },
  statNumero: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 11,
    color: '#888',
  },
  badgeConquista: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFD700' + '15',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFD700' + '30',
  },
  badgeTexto: {
    fontSize: 13,
    color: '#FFD700',
    fontWeight: '600',
    flex: 1,
  },
  botaoPrincipal: {
    backgroundColor: COR_PRIMARIA,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 12,
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  botaoSecundario: {
    backgroundColor: COR_CARD,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  botaoSecundarioTexto: {
    color: COR_PRIMARIA,
    fontSize: 16,
    fontWeight: '600',
  },
  painelFlutuante: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#16213e',
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingBottom: 20,
  },
  painelFlutuanteTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  painelIconeContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ff980015',
    alignItems: 'center',
    justifyContent: 'center',
  },
  painelInfo: {
    flex: 1,
  },
  painelTitulo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  painelSubtitulo: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  painelDireita: {
    alignItems: 'flex-end',
    gap: 4,
  },
  painelTempo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff9800',
  },
});
