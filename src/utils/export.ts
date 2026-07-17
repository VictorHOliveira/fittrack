import { Share } from 'react-native';
import { TreinoCompleto, PerfilUsuario } from '../types';
import { formatarData, formatarDuracao } from './storage';
import {
  calcularResumoPeriodo,
  calcularEvolucaoExercicio,
  listarExerciciosNoHistorico,
  getExercicioNome,
} from './stats';
import { carregarExerciciosPersonalizados } from '../services/firestoreService';

export async function compartilharRelatorio(
  historico: TreinoCompleto[],
  perfil: PerfilUsuario | null,
): Promise<void> {
  const resumo = calcularResumoPeriodo(historico, 30);

  const customExercises = await carregarExerciciosPersonalizados();
  const customMap: Record<string, string> = {};
  customExercises.forEach((e) => {
    customMap[e.id] = e.nome;
  });

  let relatorio = '📊 Relatório - Treino Mais\n';
  relatorio += `📅 Últimos 30 dias\n\n`;

  if (perfil) {
    relatorio += `👤 ${perfil.nome}\n`;
    relatorio += `🎯 Nível: ${perfil.nivel} | Objetivo: ${perfil.objetivo?.join(', ')}\n\n`;
  }

  relatorio += '📈 Resumo:\n';
  relatorio += `• ${resumo.totalTreinos} treinos realizados\n`;
  relatorio += `• ${resumo.totalSeries} séries completadas\n`;
  relatorio += `• Volume total: ${resumo.totalVolume} kg\n`;
  relatorio += `• Carga média: ${resumo.cargaMedia} kg\n`;
  relatorio += `• ${resumo.treinosPorSemana} treinos/semana\n\n`;

  if (historico.length > 0) {
    relatorio += '🏆 Treinos Recentes:\n';
    for (const t of historico.slice(0, 5)) {
      relatorio += `• ${t.treino.nome} (${formatarData(t.dataExecucao)}) - ${formatarDuracao(t.duracao)}\n`;
    }
    relatorio += '\n';

    const exercicios = listarExerciciosNoHistorico(historico);
    if (exercicios.length > 0) {
      relatorio += '💪 Evolução por Exercício:\n';
      for (const exId of exercicios.slice(0, 5)) {
        const evolucao = calcularEvolucaoExercicio(historico, exId);
        if (evolucao.cargas.length >= 2) {
          const primeira = evolucao.cargas[0];
          const ultima = evolucao.cargas[evolucao.cargas.length - 1];
          const variacao =
            primeira === 0
              ? '∞'
              : (((ultima - primeira) / primeira) * 100).toFixed(0);
          relatorio += `• ${getExercicioNome(exId, customMap)}: ${primeira}kg → ${ultima}kg (+${variacao}%)\n`;
        }
      }
    }
  }

  relatorio += '\n💪 Treine com consistência!';

  try {
    await Share.share({
      message: relatorio,
      title: 'Treino Mais - Relatório',
    });
  } catch {
    // Falha silenciosa ao compartilhar
  }
}
