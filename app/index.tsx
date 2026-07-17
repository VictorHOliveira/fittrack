import { useEffect, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { checkAndMigrate } from '../src/services/syncFirestore';
import { checkAndMigrateStorage } from '../src/utils/storage';
import { COR_FUNDO, COR_PRIMARIA } from '../src/utils/theme';

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const migrated = useRef(false);

  useEffect(() => {
    checkAndMigrateStorage();
  }, []);

  useEffect(() => {
    if (loading) return;
    if (user) {
      if (!migrated.current) {
        migrated.current = true;
        checkAndMigrate(user.uid).catch(() => {});
      }
      router.replace('/(tabs)');
    } else {
      router.replace('/login');
    }
  }, [user, loading]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COR_PRIMARIA} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COR_FUNDO,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
