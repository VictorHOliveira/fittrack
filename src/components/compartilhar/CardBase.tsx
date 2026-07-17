import { ReactNode, forwardRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COR_FUNDO, COR_PRIMARIA } from '../../utils/theme';
const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = Math.min(SCREEN_W - 40, 400);

interface CardBaseProps {
  children: ReactNode;
}

const CardBase = forwardRef<View, CardBaseProps>(({ children }, ref) => (
  <View ref={ref} collapsable={false} style={styles.container}>
    <View style={styles.inner}>{children}</View>
    <View style={styles.branding}>
      <Ionicons name="fitness" size={16} color={COR_PRIMARIA} />
      <Text style={styles.brandingTexto}>TREINO MAIS</Text>
    </View>
  </View>
));
CardBase.displayName = 'CardBase';

const styles = StyleSheet.create({
  container: {
    width: CARD_W,
    backgroundColor: COR_FUNDO,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  inner: {
    padding: 24,
    paddingBottom: 16,
  },
  branding: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#222',
    opacity: 0.5,
  },
  brandingTexto: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 2,
  },
});

export default CardBase;
