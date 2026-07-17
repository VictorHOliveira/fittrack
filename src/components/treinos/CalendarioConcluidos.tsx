import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TreinoCompleto } from '../../types';
import { COR_CARD, COR_SUCESSO, COR_PRIMARIA } from '../../utils/theme';

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

interface Props {
  historico: TreinoCompleto[];
  onDayPress: (data: string) => void;
}

function getDiasNoMes(ano: number, mes: number): number {
  return new Date(ano, mes + 1, 0).getDate();
}

function getPrimeiroDiaSemana(ano: number, mes: number): number {
  return new Date(ano, mes, 1).getDay();
}

function formatarMes(ano: number, mes: number): string {
  const nomes = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];
  return `${nomes[mes]} ${ano}`;
}

export default function CalendarioConcluidos({ historico, onDayPress }: Props) {
  const hoje = new Date();
  const [ano, setAno] = useState(hoje.getFullYear());
  const [mes, setMes] = useState(hoje.getMonth());

  const diasComTreino = new Set(
    historico.map((t) => t.dataExecucao.split('T')[0]),
  );
  const hojeStr = hoje.toISOString().split('T')[0];

  const navegar = (diff: number) => {
    const novaData = new Date(ano, mes + diff, 1);
    setAno(novaData.getFullYear());
    setMes(novaData.getMonth());
  };

  const diasNoMes = getDiasNoMes(ano, mes);
  const primeiroDia = getPrimeiroDiaSemana(ano, mes);
  const celulas: (number | null)[] = [];

  for (let i = 0; i < primeiroDia; i++) {
    celulas.push(null);
  }
  for (let d = 1; d <= diasNoMes; d++) {
    celulas.push(d);
  }

  const linhas: (number | null)[][] = [];
  for (let i = 0; i < celulas.length; i += 7) {
    linhas.push(celulas.slice(i, i + 7));
  }
  const ultima = linhas[linhas.length - 1];
  while (ultima.length < 7) {
    ultima.push(null);
  }

  return (
    <View style={styles.container}>
      <View style={styles.cabecalho}>
        <TouchableOpacity onPress={() => navegar(-1)} style={styles.setas}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.mesAno}>{formatarMes(ano, mes)}</Text>
        <TouchableOpacity onPress={() => navegar(1)} style={styles.setas}>
          <Ionicons name="chevron-forward" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.diasSemana}>
        {DIAS_SEMANA.map((d, i) => (
          <View key={i} style={styles.diaSemanaCelula}>
            <Text style={styles.diaSemanaTexto}>{d}</Text>
          </View>
        ))}
      </View>

      {linhas.map((linha, li) => (
        <View key={li} style={styles.semana}>
          {linha.map((dia, di) => {
            if (dia === null) {
              return <View key={`e-${li}-${di}`} style={styles.diaCelula} />;
            }

            const diaStr = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
            const temTreino = diasComTreino.has(diaStr);
            const ehHoje = diaStr === hojeStr;

            return (
              <TouchableOpacity
                key={dia}
                style={styles.diaCelula}
                onPress={() => onDayPress(diaStr)}
                activeOpacity={0.6}
              >
                <View
                  style={[styles.diaCircle, ehHoje && styles.diaCircleHoje]}
                >
                  <Text
                    style={[styles.diaNumero, ehHoje && styles.diaNumeroHoje]}
                  >
                    {dia}
                  </Text>
                </View>
                {temTreino && <View style={styles.bolinha} />}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COR_CARD,
    borderRadius: 16,
    overflow: 'hidden',
    padding: 16,
    width: '100%',
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  setas: {
    padding: 8,
  },
  mesAno: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  diasSemana: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  diaSemanaCelula: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  diaSemanaTexto: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
  },
  semana: {
    flexDirection: 'row',
  },
  diaCelula: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    minHeight: 44,
  },
  diaCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diaCircleHoje: {
    backgroundColor: COR_PRIMARIA,
  },
  diaNumero: {
    fontSize: 14,
    color: '#fff',
  },
  diaNumeroHoje: {
    fontWeight: 'bold',
  },
  bolinha: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COR_SUCESSO,
    marginTop: 2,
  },
});
