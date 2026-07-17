import { useState } from 'react';
import { Image, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EXERCISE_GIFS } from '../data/exerciseGifs';

interface Props {
  exercicioId?: string;
  icone: string;
  corGrupo: string;
  size?: number;
  borderRadius?: number;
}

export default function ExercicioGif({
  exercicioId,
  icone,
  corGrupo,
  size = 48,
  borderRadius = 14,
}: Props) {
  const [erro, setErro] = useState(false);
  const gifSource = exercicioId ? EXERCISE_GIFS[exercicioId] : null;

  if (gifSource && !erro) {
    return (
      <Image
        source={gifSource}
        style={[styles.gif, { width: size, height: size, borderRadius }]}
        resizeMode="cover"
        onError={() => setErro(true)}
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        {
          width: size,
          height: size,
          borderRadius,
          backgroundColor: corGrupo + '20',
        },
      ]}
    >
      <Ionicons name={icone as any} size={size * 0.5} color={corGrupo} />
    </View>
  );
}

const styles = StyleSheet.create({
  gif: {
    backgroundColor: '#16213e',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
