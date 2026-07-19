import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  exercicioId?: string;
  icone: string;
  corGrupo: string;
  imageUrl?: string;
  size?: number;
  borderRadius?: number;
}

export default function ExercicioGif({
  exercicioId,
  icone,
  corGrupo,
  imageUrl,
  size = 48,
  borderRadius = 14,
}: Props) {
  const [erro, setErro] = useState(false);

  if (imageUrl && !erro) {
    return (
      <Image
        source={imageUrl}
        style={[styles.gif, { width: size, height: size, borderRadius }]}
        contentFit="cover"
        transition={300}
        onError={() => setErro(true)}
        placeholder={null}
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
