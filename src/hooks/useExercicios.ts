import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { Exercicio } from '../types';
import { carregarExerciciosPersonalizados } from '../services/firestoreService';
import { setCustomExercises, getExercicioNomeMap } from '../utils/exerciseMap';
import exerciciosData from '../data/exercicios.json';

export function resetExerciciosSync() {}

export function useExercicios() {
  const [exercicios, setExercicios] = useState<Exercicio[]>([]);
  const [customLoaded, setCustomLoaded] = useState(false);

  const sincronizar = useCallback(async () => {
    const custom = await carregarExerciciosPersonalizados();
    setExercicios([...exerciciosData, ...custom]);
    setCustomLoaded(true);
    setCustomExercises(custom);
  }, []);

  useFocusEffect(
    useCallback(() => {
      sincronizar();
    }, [sincronizar]),
  );

  const find = useCallback(
    (id: string): Exercicio | undefined => exercicios.find((e) => e.id === id),
    [exercicios],
  );

  const getNome = useCallback(
    (id: string): string => getExercicioNomeMap()[id] || id,
    [customLoaded],
  );

  return { exercicios, customLoaded, find, getNome, recarregar: sincronizar };
}
