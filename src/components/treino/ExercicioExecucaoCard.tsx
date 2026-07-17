import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ExercicioGif from '../ExercicioGif';
import { COR_PRIMARIA, COR_CARD, COR_SUCESSO } from '../../utils/theme';

interface Serie {
  cargas: number;
  repeticoes: number;
  concluida: boolean;
}

interface ExercicioExecucao {
  exercicioId: string;
  nome: string;
  musculo: string;
  icone: string;
  corGrupo: string;
  descanso: number;
  descansoRestante: number;
  series: Serie[];
  anterior?: { cargas: number; repeticoes: number }[];
}

interface Props {
  exercicio: ExercicioExecucao;
  exIndex: number;
  onAtualizarSerie: (
    exIndex: number,
    serIndex: number,
    campo: 'cargas' | 'repeticoes',
    valor: number | string,
  ) => void;
  onMarcarConcluida: (exIndex: number, serIndex: number) => void;
  onAdicionarSerie: (exIndex: number) => void;
  onRemoverSerie: (exIndex: number) => void;
  onEditarDescanso: (exIndex: number) => void;
  onDetalhe?: () => void;
  formatarDuracao: (s: number) => string;
}

export default function ExercicioExecucaoCard({
  exercicio,
  exIndex,
  onAtualizarSerie,
  onMarcarConcluida,
  onAdicionarSerie,
  onRemoverSerie,
  onEditarDescanso,
  onDetalhe,
  formatarDuracao,
}: Props) {
  const nomeIcone = exercicio.icone || 'fitness';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerTouchable}
          activeOpacity={0.7}
          onPress={onDetalhe}
          disabled={!onDetalhe}
        >
          <ExercicioGif
            exercicioId={exercicio.exercicioId}
            icone={nomeIcone}
            corGrupo={exercicio.corGrupo || COR_PRIMARIA}
            size={36}
            borderRadius={10}
          />
          <View style={styles.headerInfo}>
            <Text style={styles.nome}>{exercicio.nome}</Text>
            <Text style={styles.musculo}>{exercicio.musculo}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.descansoBadge}
          onPress={() => onEditarDescanso(exIndex)}
        >
          <Ionicons name="pause-circle" size={12} color="#ff9800" />
          <Text style={styles.descansoBadgeTexto}>
            {exercicio.descansoRestante > 0
              ? formatarDuracao(exercicio.descansoRestante)
              : `${exercicio.descanso}s`}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.seriesHeader}>
        <Text style={styles.serieCol}>Série</Text>
        <Text style={[styles.serieCol, { width: 72 }]}>Anterior</Text>
        <Text style={styles.serieCol}>Carga (kg)</Text>
        <Text style={styles.serieCol}>Reps</Text>
        <Text style={styles.serieCol}>OK</Text>
      </View>

      {exercicio.series.map((serie, serIndex) => {
        const temAnterior =
          exercicio.anterior?.[serIndex] &&
          exercicio.anterior[serIndex].cargas > 0;
        return (
          <View
            key={serIndex}
            style={[styles.serieRow, serie.concluida && styles.serieConcluida]}
          >
            <Text style={styles.serieNumero}>{serIndex + 1}</Text>

            <View style={styles.anteriorContainer}>
              <Text style={styles.anteriorTexto}>
                {temAnterior
                  ? `${exercicio.anterior![serIndex].cargas}kg × ${exercicio.anterior![serIndex].repeticoes}`
                  : '—'}
              </Text>
            </View>

            <View style={styles.serieControles}>
              <TouchableOpacity
                onPress={() =>
                  onAtualizarSerie(
                    exIndex,
                    serIndex,
                    'cargas',
                    serie.cargas - 2.5,
                  )
                }
              >
                <Ionicons name="remove-circle" size={24} color="#888" />
              </TouchableOpacity>
              <TextInput
                style={styles.serieInput}
                keyboardType="decimal-pad"
                value={String(serie.cargas || '')}
                onChangeText={(text) =>
                  onAtualizarSerie(exIndex, serIndex, 'cargas', text)
                }
                onBlur={() =>
                  onAtualizarSerie(
                    exIndex,
                    serIndex,
                    'cargas',
                    String(serie.cargas),
                  )
                }
                selectTextOnFocus
              />
              <TouchableOpacity
                onPress={() =>
                  onAtualizarSerie(
                    exIndex,
                    serIndex,
                    'cargas',
                    serie.cargas + 2.5,
                  )
                }
              >
                <Ionicons name="add-circle" size={24} color="#888" />
              </TouchableOpacity>
            </View>

            <View style={styles.serieControles}>
              <TouchableOpacity
                onPress={() =>
                  onAtualizarSerie(
                    exIndex,
                    serIndex,
                    'repeticoes',
                    serie.repeticoes - 1,
                  )
                }
              >
                <Ionicons name="remove-circle" size={24} color="#888" />
              </TouchableOpacity>
              <Text style={styles.serieValor}>{serie.repeticoes}</Text>
              <TouchableOpacity
                onPress={() =>
                  onAtualizarSerie(
                    exIndex,
                    serIndex,
                    'repeticoes',
                    serie.repeticoes + 1,
                  )
                }
              >
                <Ionicons name="add-circle" size={24} color="#888" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => onMarcarConcluida(exIndex, serIndex)}
            >
              <Ionicons
                name={serie.concluida ? 'checkmark-circle' : 'ellipse-outline'}
                size={28}
                color={serie.concluida ? COR_SUCESSO : '#555'}
              />
            </TouchableOpacity>
          </View>
        );
      })}

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.footerBotao,
            exercicio.series.length <= 1 && styles.footerBotaoDesabilitado,
          ]}
          onPress={() => onRemoverSerie(exIndex)}
          disabled={exercicio.series.length <= 1}
        >
          <Ionicons
            name="remove-circle"
            size={18}
            color={exercicio.series.length <= 1 ? '#444' : '#ff6b6b'}
          />
          <Text
            style={[
              styles.footerBotaoTexto,
              exercicio.series.length <= 1 &&
                styles.footerBotaoTextoDesabilitado,
            ]}
          >
            Série
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.footerBotao}
          onPress={() => onAdicionarSerie(exIndex)}
        >
          <Ionicons name="add-circle" size={18} color={COR_SUCESSO} />
          <Text style={styles.footerBotaoTexto}>Série</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COR_CARD,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  headerTouchable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerInfo: {
    flex: 1,
  },
  nome: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },
  musculo: {
    fontSize: 11,
    color: COR_PRIMARIA,
  },
  seriesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  serieCol: {
    flex: 1,
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  serieRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  serieConcluida: {
    backgroundColor: 'rgba(76,175,80,0.1)',
    borderRadius: 8,
  },
  serieNumero: {
    width: 30,
    textAlign: 'center',
    color: '#888',
    fontWeight: 'bold',
  },
  serieControles: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  anteriorContainer: {
    width: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  anteriorTexto: {
    color: '#666',
    fontSize: 10,
    textAlign: 'center',
  },
  serieValor: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    minWidth: 30,
    textAlign: 'center',
  },
  serieInput: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    minWidth: 40,
    textAlign: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  footerBotao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerBotaoDesabilitado: {
    opacity: 0.4,
  },
  footerBotaoTexto: {
    color: '#ccc',
    fontSize: 13,
    fontWeight: '600',
  },
  footerBotaoTextoDesabilitado: {
    color: '#555',
  },
  descansoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,152,0,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  descansoBadgeTexto: {
    color: '#ff9800',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
