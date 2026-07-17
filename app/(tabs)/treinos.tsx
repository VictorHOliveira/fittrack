import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTreinos } from '../../src/hooks/useTreinos';
import { TreinoPreDefinido } from '../../src/types';
import {
  listarTreinosPreDefinidos,
  jaImportouTreino,
} from '../../src/utils/storage';
import {
  COR_PRIMARIA,
  COR_FUNDO,
  COR_CARD,
  NIVEL_CORES,
  NIVEL_ICONS,
} from '../../src/utils/theme';

export default function TreinosScreen() {
  const router = useRouter();
  const { treinos, carregando, deletar } = useTreinos();
  const [preDefinidos, setPreDefinidos] = useState<TreinoPreDefinido[]>([]);
  const [importados, setImportados] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      const lista = await listarTreinosPreDefinidos();
      setPreDefinidos(lista);
      const importadosSet = new Set<string>();
      for (const t of lista) {
        if (await jaImportouTreino(t.id)) {
          importadosSet.add(t.id);
        }
      }
      setImportados(importadosSet);
    })();
  }, [treinos]);

  if (carregando) {
    return (
      <View style={styles.container}>
        <Text style={styles.carregando}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => router.push('/')}
            style={styles.botaoVoltar}
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.titulo}>Meus Treinos</Text>
        </View>
        <TouchableOpacity
          style={styles.botaoAdicionar}
          onPress={() => router.push('/criar-treino')}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {treinos.length === 0 && (
        <View style={styles.vazio}>
          <Ionicons name="barbell-outline" size={64} color="#444" />
          <Text style={styles.vazioTexto}>Nenhum treino criado</Text>
          <Text style={styles.vazioSubtexto}>
            Crie um treino ou importe um modelo pronto abaixo
          </Text>
        </View>
      )}

      <FlatList
        data={[]}
        ListHeaderComponent={
          <>
            {treinos.length > 0 && (
              <View style={styles.secao}>
                <FlatList
                  data={treinos}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.card}
                      onPress={() => router.push(`/treino/${item.id}`)}
                    >
                      <View style={styles.cardContent}>
                        <View style={styles.cardInfo}>
                          <Text style={styles.cardNome}>{item.nome}</Text>
                          <Text style={styles.cardDesc}>
                            {item.exercicios.length} exercício(s)
                            {item.diaSemana &&
                            (Array.isArray(item.diaSemana)
                              ? item.diaSemana.length > 0
                              : true)
                              ? ` • ${Array.isArray(item.diaSemana) ? item.diaSemana.join(', ') : item.diaSemana}`
                              : ''}
                          </Text>
                        </View>
                        <View style={styles.cardAcoes}>
                          <TouchableOpacity
                            onPress={() =>
                              router.push({
                                pathname: '/criar-treino',
                                params: { id: item.id },
                              })
                            }
                            style={styles.botaoEditar}
                          >
                            <Ionicons
                              name="pencil"
                              size={18}
                              color={COR_PRIMARIA}
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => deletar(item.id)}
                            style={styles.botaoDeletar}
                          >
                            <Ionicons name="trash" size={18} color="#ff6b6b" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}

            <View style={styles.secao}>
              <Text style={styles.secaoTitulo}>Treinos Prontos</Text>
              <Text style={styles.secaoSubtitulo}>
                Modelos prontos para importar
              </Text>

              <View style={styles.niveisGrid}>
                {preDefinidos.map((item) => {
                  const cor = NIVEL_CORES[item.nivel] || COR_PRIMARIA;
                  const jaImp = importados.has(item.id);
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.nivelCard,
                        jaImp && styles.nivelCardImportado,
                      ]}
                      onPress={() =>
                        router.push({
                          pathname: '/treino-predefinido',
                          params: { id: item.id },
                        })
                      }
                    >
                      <View
                        style={[
                          styles.nivelIcone,
                          { backgroundColor: cor + '20' },
                        ]}
                      >
                        <Ionicons
                          name={(NIVEL_ICONS[item.nivel] as any) || 'fitness'}
                          size={28}
                          color={cor}
                        />
                      </View>
                      <Text style={styles.nivelNome} numberOfLines={2}>
                        {item.nome}
                      </Text>
                      <Text style={styles.nivelInfo}>
                        {item.frequenciaSemanal}x/semana • ~
                        {item.duracaoEstimada}min
                      </Text>
                      {jaImp && (
                        <View style={styles.importadoBadge}>
                          <Ionicons name="checkmark" size={12} color="#fff" />
                          <Text style={styles.importadoBadgeTexto}>
                            Importado
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </>
        }
        renderItem={null}
        contentContainerStyle={styles.lista}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COR_FUNDO,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  botaoVoltar: {
    padding: 4,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  botaoAdicionar: {
    backgroundColor: COR_PRIMARIA,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carregando: {
    color: '#888',
    textAlign: 'center',
    marginTop: 40,
  },
  vazio: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  vazioTexto: {
    fontSize: 18,
    color: '#888',
    fontWeight: '600',
  },
  vazioSubtexto: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  lista: {
    padding: 20,
    paddingBottom: 40,
  },
  secao: {
    marginBottom: 28,
  },
  secaoTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  secaoSubtitulo: {
    fontSize: 13,
    color: '#666',
    marginBottom: 14,
  },
  card: {
    backgroundColor: COR_CARD,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 12,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: '#888',
  },
  cardAcoes: {
    flexDirection: 'row',
    gap: 10,
  },
  botaoEditar: {
    padding: 8,
  },
  botaoDeletar: {
    padding: 8,
  },
  niveisGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  nivelCard: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: COR_CARD,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
    gap: 8,
  },
  nivelCardImportado: {
    borderColor: COR_PRIMARIA + '40',
    backgroundColor: COR_PRIMARIA + '08',
  },
  nivelIcone: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nivelNome: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 18,
  },
  nivelInfo: {
    fontSize: 11,
    color: '#666',
  },
  importadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COR_PRIMARIA,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 2,
  },
  importadoBadgeTexto: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
});
