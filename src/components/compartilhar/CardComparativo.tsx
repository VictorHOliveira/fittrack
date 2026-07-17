import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CardBase from './CardBase';
import {
  COR_PRIMARIA,
  COR_CARD,
  COR_SUCESSO,
  COR_AVISO,
} from '../../utils/theme';
import { formatarDuracao } from '../../utils/format';

interface DadosComparativo {
  volume: number;
  series: number;
  duracao: number;
}

interface ExercicioComparativo {
  nome: string;
  volumeAtual: number;
  volumeAnterior: number;
}

interface Props {
  treinoNome: string;
  atual: DadosComparativo;
  anterior: DadosComparativo | null;
  comparativoExercicios: ExercicioComparativo[];
}

function CalcPct(
  atual: number,
  antigo: number,
): { pct: number; melhor: boolean } | null {
  if (antigo === 0) return null;
  const pct = Math.round(((atual - antigo) / antigo) * 100);
  return { pct, melhor: pct >= 0 };
}

function LinhaComparativa({
  label,
  atual,
  anterior,
}: {
  label: string;
  atual: string | number;
  anterior: string | number;
}) {
  const valAtual = typeof atual === 'string' ? atual : String(atual);
  const valAnterior =
    typeof anterior === 'string' ? anterior : String(anterior);
  return (
    <View style={styles.compLinha}>
      <Text style={styles.compLabel}>{label}</Text>
      <View style={styles.compValores}>
        <Text style={styles.compAntes}>{valAnterior}</Text>
        <Ionicons name="arrow-forward" size={14} color="#666" />
        <Text style={styles.compAgora}>{valAtual}</Text>
      </View>
    </View>
  );
}

export default function CardComparativo(props: Props) {
  const pctVolume = props.anterior
    ? CalcPct(props.atual.volume, props.anterior.volume)
    : null;

  return (
    <CardBase>
      <View style={styles.header}>
        <Ionicons name="bar-chart" size={28} color={COR_PRIMARIA} />
        <Text style={styles.titulo}>COMPARATIVO</Text>
        <Text style={styles.subtitulo}>{props.treinoNome}</Text>
      </View>

      {pctVolume && (
        <View
          style={[
            styles.badge,
            {
              backgroundColor: pctVolume.melhor
                ? '#4CAF50' + '20'
                : '#ff9800' + '20',
            },
          ]}
        >
          <Ionicons
            name={pctVolume.melhor ? 'trending-up' : 'trending-down'}
            size={18}
            color={pctVolume.melhor ? COR_SUCESSO : COR_AVISO}
          />
          <Text
            style={[
              styles.badgeTexto,
              { color: pctVolume.melhor ? COR_SUCESSO : COR_AVISO },
            ]}
          >
            {pctVolume.melhor ? '+' : ''}
            {pctVolume.pct}% de volume
          </Text>
        </View>
      )}

      <View style={styles.comparativo}>
        <Text style={styles.comparativoTitulo}>HOJE VS ÚLTIMO TREINO</Text>

        {props.anterior ? (
          <>
            <LinhaComparativa
              label="Volume"
              atual={`${props.atual.volume} kg`}
              anterior={`${props.anterior.volume} kg`}
            />
            <LinhaComparativa
              label="Séries"
              atual={props.atual.series}
              anterior={props.anterior.series}
            />
            <LinhaComparativa
              label="Duração"
              atual={formatarDuracao(props.atual.duracao)}
              anterior={formatarDuracao(props.anterior.duracao)}
            />
          </>
        ) : (
          <Text style={styles.semDados}>Primeira vez fazendo este treino!</Text>
        )}
      </View>

      {props.comparativoExercicios.length > 0 && (
        <>
          <Text style={styles.sectionTitulo}>EVOLUÇÃO POR EXERCÍCIO</Text>
          {props.comparativoExercicios.map((ex, i) => {
            const diff =
              ex.volumeAnterior > 0
                ? Math.round(
                    ((ex.volumeAtual - ex.volumeAnterior) / ex.volumeAnterior) *
                      100,
                  )
                : null;
            return (
              <View key={i} style={styles.exRow}>
                <Text style={styles.exNome} numberOfLines={1}>
                  {ex.nome}
                </Text>
                <View style={styles.exValores}>
                  <Text style={styles.exAntes}>{ex.volumeAnterior} kg</Text>
                  <Ionicons name="arrow-forward" size={12} color="#666" />
                  <Text style={styles.exAgora}>{ex.volumeAtual} kg</Text>
                  {diff !== null && (
                    <Text
                      style={[
                        styles.exDiff,
                        { color: diff >= 0 ? COR_SUCESSO : COR_AVISO },
                      ]}
                    >
                      {diff >= 0 ? '+' : ''}
                      {diff}%
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </>
      )}
    </CardBase>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginBottom: 16 },
  titulo: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 2,
    marginTop: 6,
  },
  subtitulo: { fontSize: 12, color: COR_PRIMARIA, marginTop: 2 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 16,
    alignSelf: 'center',
  },
  badgeTexto: { fontSize: 13, fontWeight: 'bold' },
  comparativo: { marginBottom: 16 },
  comparativoTitulo: {
    fontSize: 11,
    color: '#888',
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 10,
  },
  compLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  compLabel: { fontSize: 13, color: '#aaa', fontWeight: '500' },
  compValores: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  compAntes: { fontSize: 12, color: '#666' },
  compAgora: { fontSize: 13, color: '#fff', fontWeight: 'bold' },
  semDados: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
  sectionTitulo: {
    fontSize: 11,
    color: '#888',
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 4,
  },
  exRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COR_CARD,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 6,
  },
  exNome: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  exValores: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  exAntes: { fontSize: 11, color: '#666' },
  exAgora: { fontSize: 12, color: '#fff', fontWeight: 'bold' },
  exDiff: { fontSize: 11, fontWeight: 'bold' },
});
