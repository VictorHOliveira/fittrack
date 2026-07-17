import { useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAgua } from '../../src/hooks/useAgua';
import CalendarioAgua from '../../src/components/agua/CalendarioAgua';
import HistoricoAguaModal from '../../src/components/agua/HistoricoAguaModal';
import {
  COR_PRIMARIA,
  COR_FUNDO,
  COR_CARD,
  COR_SUCESSO,
} from '../../src/utils/theme';

const COR_AGUA = '#00BFFF';

export default function AguaScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const {
    config,
    totalCoposHoje,
    totalMlHoje,
    progresso,
    registroHoje,
    registros,
    carregando,
    adicionarCopo,
  } = useAgua();

  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

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

  if (carregando) {
    return (
      <View style={styles.container}>
        <Text style={styles.carregando}>Carregando...</Text>
      </View>
    );
  }

  const metaAtingida = totalCoposHoje >= config.metaDiaria;

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.progressoSection}>
          <View style={styles.circleContainer}>
            <View
              style={[styles.circle, metaAtingida && styles.circleCompleto]}
            >
              <Ionicons
                name={metaAtingida ? 'checkmark-circle' : 'water'}
                size={48}
                color={metaAtingida ? COR_SUCESSO : COR_AGUA}
              />
              <Text style={styles.circleNumero}>{totalCoposHoje}</Text>
              <Text style={styles.circleLabel}>
                de {config.metaDiaria} copos
              </Text>
            </View>
          </View>

          <View style={styles.barraGrandeContainer}>
            <View
              style={[
                styles.barraGrande,
                { width: `${progresso * 100}%` },
                metaAtingida && styles.barraGrandeCompleta,
              ]}
            />
          </View>

          <Text style={styles.totalMl}>{totalMlHoje}ml consumidos hoje</Text>
        </View>

        <TouchableOpacity
          style={[styles.botaoTomei, metaAtingida && styles.botaoTomeiCompleto]}
          onPress={adicionarCopo}
          activeOpacity={0.7}
        >
          <Ionicons
            name={metaAtingida ? 'happy' : 'water'}
            size={28}
            color="#fff"
          />
          <Text style={styles.botaoTomeiTexto}>
            {metaAtingida ? 'Mais um copo!' : 'Tomei! 💧'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botaoConfig}
          onPress={() => router.push('/agua/config')}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-outline" size={20} color={COR_PRIMARIA} />
          <Text style={styles.botaoConfigTexto}>Configurar Notificações</Text>
        </TouchableOpacity>

        {registroHoje.copos.length > 0 && (
          <View style={styles.historicoSection}>
            <Text style={styles.historicoTitulo}>Registros de hoje</Text>
            {registroHoje.copos.map((copo, idx) => (
              <View key={idx} style={styles.historicoItem}>
                <Ionicons name="water" size={16} color={COR_AGUA} />
                <Text style={styles.historicoTexto}>
                  {copo.ml}ml •{' '}
                  {new Date(copo.timestamp).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            ))}
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
            <CalendarioAgua
              registros={registros}
              onDayPress={(data) => {
                setSelectedDate(data);
                setShowCalendar(false);
              }}
            />
          </View>
        </View>
      </Modal>

      <HistoricoAguaModal
        visible={!!selectedDate}
        data={selectedDate}
        registros={registros}
        onClose={() => setSelectedDate('')}
      />
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
  progressoSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  circleContainer: {
    marginBottom: 20,
  },
  circle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COR_CARD,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: COR_AGUA,
    gap: 4,
  },
  circleCompleto: {
    borderColor: COR_SUCESSO,
  },
  circleNumero: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  circleLabel: {
    fontSize: 13,
    color: '#888',
  },
  barraGrandeContainer: {
    width: '100%',
    height: 10,
    backgroundColor: '#333',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  barraGrande: {
    height: '100%',
    backgroundColor: COR_AGUA,
    borderRadius: 5,
  },
  barraGrandeCompleta: {
    backgroundColor: COR_SUCESSO,
  },
  totalMl: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  botaoTomei: {
    backgroundColor: COR_AGUA,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 24,
  },
  botaoTomeiCompleto: {
    backgroundColor: COR_SUCESSO,
  },
  botaoTomeiTexto: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  historicoSection: {
    backgroundColor: COR_CARD,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  historicoTitulo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  historicoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  historicoTexto: {
    fontSize: 14,
    color: '#aaa',
  },
  botaoConfig: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: COR_CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  botaoConfigTexto: {
    fontSize: 14,
    color: COR_PRIMARIA,
    fontWeight: '600',
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
});
