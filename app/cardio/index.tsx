import { useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCardio, TIPOS_CARDIO } from '../../src/hooks/useCardio';
import { COR_PRIMARIA, COR_FUNDO, COR_CARD } from '../../src/utils/theme';
import { formatarDataCompleta } from '../../src/utils/format';

const COR_CARDIO = '#FF6B35';

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const ICON_MAP: Record<string, string> = {
  bicicleta: 'bicycle',
  caminhada: 'walk',
  corrida: 'pulse',
  natacao: 'water',
  pular_corda: 'resize',
  eliptico: 'ellipse',
  bike_ergometrica: 'bicycle',
  outro: 'add-circle',
};

function getTipoLabel(tipo: string, tipoOutro?: string): string {
  if (tipo === 'outro' && tipoOutro) return tipoOutro;
  return TIPOS_CARDIO.find((t) => t.valor === tipo)?.label || tipo;
}

function getTipoIcon(tipo: string): string {
  return ICON_MAP[tipo] || 'fitness';
}

function getDiasNoMes(ano: number, mes: number) {
  return new Date(ano, mes + 1, 0).getDate();
}
function getPrimeiroDiaSemana(ano: number, mes: number) {
  return new Date(ano, mes, 1).getDay();
}
function formatarMes(ano: number, mes: number) {
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

export default function CardioScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { entries, entriesHoje, carregando, deletar } = useCardio();

  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  const hoje = new Date();
  const [ano, setAno] = useState(hoje.getFullYear());
  const [mes, setMes] = useState(hoje.getMonth());

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => setShowCalendar(true)}
          style={{ marginRight: 16 }}
        >
          <Ionicons name="calendar" size={24} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const totalMin = entriesHoje.reduce((acc, e) => acc + e.duracaoMinutos, 0);
  const totalCal = entriesHoje.reduce((acc, e) => acc + e.calorias, 0);

  const confirmarDeletar = (id: string) => {
    Alert.alert('Remover', 'Tem certeza que deseja remover este registro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => deletar(id) },
    ]);
  };

  // --- Calendar ---
  const datasComRegistro = new Set(entries.map((e) => e.data));
  const hojeStr = hoje.toISOString().split('T')[0];
  const entriesDoDia = entries.filter((e) => e.data === selectedDate);

  const diasNoMes = getDiasNoMes(ano, mes);
  const primeiroDia = getPrimeiroDiaSemana(ano, mes);
  const celulas: (number | null)[] = [];
  for (let i = 0; i < primeiroDia; i++) celulas.push(null);
  for (let d = 1; d <= diasNoMes; d++) celulas.push(d);

  const linhas: (number | null)[][] = [];
  for (let i = 0; i < celulas.length; i += 7) {
    linhas.push(celulas.slice(i, i + 7));
  }
  const ultima = linhas[linhas.length - 1];
  while (ultima.length < 7) {
    ultima.push(null);
  }

  if (carregando) {
    return (
      <View style={styles.container}>
        <Text style={styles.carregando}>Carregando...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        removeClippedSubviews
      >
        {entriesHoje.length > 0 && (
          <View style={styles.resumoCard}>
            <Ionicons name="pulse" size={24} color={COR_CARDIO} />
            <Text style={styles.resumoTexto}>
              {totalMin}min • {totalCal}kcal
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.botaoAdicionar}
          onPress={() => router.push('/cardio/adicionar')}
          activeOpacity={0.7}
        >
          <Ionicons name="add-circle" size={24} color="#fff" />
          <Text style={styles.botaoAdicionarTexto}>Adicionar Cardio</Text>
        </TouchableOpacity>

        {entriesHoje.length > 0 && (
          <View style={styles.listaSection}>
            <Text style={styles.listaTitulo}>Registros de hoje</Text>
            {entriesHoje.map((entry) => (
              <View key={entry.id} style={styles.entryCard}>
                <View style={styles.entryHeader}>
                  <Ionicons
                    name={getTipoIcon(entry.tipo) as any}
                    size={20}
                    color={COR_CARDIO}
                  />
                  <Text style={styles.entryTipo}>
                    {getTipoLabel(entry.tipo, entry.tipoOutro)}
                  </Text>
                  <TouchableOpacity onPress={() => confirmarDeletar(entry.id)}>
                    <Ionicons name="close-circle" size={20} color="#666" />
                  </TouchableOpacity>
                </View>
                <View style={styles.entryStats}>
                  <Text style={styles.entryStat}>
                    ⏱ {entry.duracaoMinutos}min
                  </Text>
                  <Text style={styles.entryStat}>🔥 {entry.calorias}kcal</Text>
                  {entry.distanciaKm !== undefined && (
                    <Text style={styles.entryStat}>
                      📏 {entry.distanciaKm}km
                    </Text>
                  )}
                </View>
                {entry.observacao && (
                  <Text style={styles.entryObs}>{entry.observacao}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {entriesHoje.length === 0 && (
          <View style={styles.vazio}>
            <Ionicons name="fitness-outline" size={48} color="#444" />
            <Text style={styles.vazioTexto}>Nenhum cardio registrado hoje</Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showCalendar}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCalendar(false)}
      >
        <View style={styles.calOverlay}>
          <TouchableOpacity
            style={styles.calBackdrop}
            activeOpacity={1}
            onPress={() => setShowCalendar(false)}
          />
          <View style={styles.calContainer}>
            <View style={styles.calCard}>
              <View style={styles.cabecalho}>
                <TouchableOpacity
                  onPress={() => {
                    const d = new Date(ano, mes - 1, 1);
                    setAno(d.getFullYear());
                    setMes(d.getMonth());
                  }}
                  style={styles.setas}
                >
                  <Ionicons name="chevron-back" size={22} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.mesAno}>{formatarMes(ano, mes)}</Text>
                <TouchableOpacity
                  onPress={() => {
                    const d = new Date(ano, mes + 1, 1);
                    setAno(d.getFullYear());
                    setMes(d.getMonth());
                  }}
                  style={styles.setas}
                >
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
                    if (dia === null)
                      return (
                        <View key={`e-${li}-${di}`} style={styles.diaCelula} />
                      );
                    const diaStr = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
                    const temRegistro = datasComRegistro.has(diaStr);
                    const ehHoje = diaStr === hojeStr;
                    return (
                      <TouchableOpacity
                        key={dia}
                        style={styles.diaCelula}
                        onPress={() => {
                          setSelectedDate(diaStr);
                          setShowCalendar(false);
                        }}
                        activeOpacity={0.6}
                      >
                        <View
                          style={[
                            styles.diaCircle,
                            ehHoje && styles.diaCircleHoje,
                          ]}
                        >
                          <Text
                            style={[
                              styles.diaNumero,
                              ehHoje && styles.diaNumeroHoje,
                            ]}
                          >
                            {dia}
                          </Text>
                        </View>
                        {temRegistro && <View style={styles.bolinha} />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={!!selectedDate}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedDate('')}
      >
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={() => setSelectedDate('')}
          />
          <View style={styles.modal}>
            <TouchableOpacity
              style={styles.btnFechar}
              onPress={() => setSelectedDate('')}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <ScrollView
              contentContainerStyle={styles.modalConteudo}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.modalIcon}>
                <Ionicons name="pulse" size={32} color={COR_CARDIO} />
              </View>
              <Text style={styles.modalData}>
                {formatarDataCompleta(selectedDate)}
              </Text>
              {entriesDoDia.length === 0 ? (
                <Text style={styles.semRegistro}>Nenhum cardio neste dia.</Text>
              ) : (
                <>
                  <View style={styles.totalCard}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={COR_CARDIO}
                    />
                    <Text style={styles.totalTexto}>
                      Total:{' '}
                      {entriesDoDia.reduce((a, e) => a + e.duracaoMinutos, 0)}
                      min • {entriesDoDia.reduce((a, e) => a + e.calorias, 0)}
                      kcal
                    </Text>
                  </View>
                  {entriesDoDia.map((entry) => (
                    <View key={entry.id} style={styles.entryCard}>
                      <View style={styles.entryHeader}>
                        <Ionicons
                          name={ICON_MAP[entry.tipo] as any}
                          size={18}
                          color={COR_CARDIO}
                        />
                        <Text style={styles.entryTipo}>
                          {getTipoLabel(entry.tipo, entry.tipoOutro)}
                        </Text>
                      </View>
                      <View style={styles.entryStats}>
                        <Text style={styles.entryStat}>
                          ⏱ {entry.duracaoMinutos}min
                        </Text>
                        <Text style={styles.entryStat}>
                          🔥 {entry.calorias}kcal
                        </Text>
                        {entry.distanciaKm !== undefined && (
                          <Text style={styles.entryStat}>
                            📏 {entry.distanciaKm}km
                          </Text>
                        )}
                      </View>
                      {entry.observacao && (
                        <Text style={styles.entryObs}>{entry.observacao}</Text>
                      )}
                    </View>
                  ))}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COR_FUNDO,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  carregando: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 60,
  },
  resumoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: COR_CARD,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  resumoTexto: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  botaoAdicionar: {
    backgroundColor: COR_CARDIO,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 24,
  },
  botaoAdicionarTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listaSection: {
    marginBottom: 24,
  },
  listaTitulo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  entryCard: {
    backgroundColor: COR_CARD,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  entryTipo: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  entryStats: {
    flexDirection: 'row',
    gap: 16,
  },
  entryStat: {
    fontSize: 13,
    color: '#aaa',
  },
  entryObs: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
    fontStyle: 'italic',
  },
  vazio: {
    alignItems: 'center',
    paddingTop: 40,
    gap: 12,
  },
  vazioTexto: {
    fontSize: 14,
    color: '#666',
  },
  calOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  calBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  calContainer: {
    width: '100%',
    maxWidth: 340,
  },
  calCard: {
    backgroundColor: COR_CARD,
    borderRadius: 16,
    overflow: 'hidden',
    padding: 16,
    marginBottom: 16,
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  setas: { padding: 8 },
  mesAno: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  diasSemana: { flexDirection: 'row', marginBottom: 8 },
  diaSemanaCelula: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  diaSemanaTexto: { fontSize: 12, color: '#888', fontWeight: '600' },
  semana: { flexDirection: 'row' },
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
  diaCircleHoje: { backgroundColor: COR_PRIMARIA },
  diaNumero: { fontSize: 14, color: '#fff' },
  diaNumeroHoje: { fontWeight: 'bold' },
  bolinha: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COR_CARDIO,
    marginTop: 2,
  },
  hint: { textAlign: 'center', fontSize: 13, color: '#666' },
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.6)' },
  modal: {
    backgroundColor: COR_FUNDO,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  btnFechar: {
    alignSelf: 'flex-end',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COR_CARD,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  modalConteudo: { alignItems: 'center', paddingBottom: 20 },
  modalIcon: { marginBottom: 12 },
  modalData: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  semRegistro: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    paddingVertical: 20,
  },
  totalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COR_CARD,
    borderRadius: 12,
    marginBottom: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: COR_CARDIO + '40',
  },
  totalTexto: { fontSize: 14, color: COR_CARDIO, fontWeight: 'bold' },
});
