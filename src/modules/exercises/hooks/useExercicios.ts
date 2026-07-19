import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { Exercicio } from '../types';
import { carregarExerciciosPersonalizados } from '../services/exerciseService';
import { setCustomExercises, getExercicioNomeMap } from '../utils/exerciseMap';
import { exercicios } from '../data';

export function resetExerciciosSync() {}

export function useExercicios() {
  const [exerciciosState, setExercicios] = useState<Exercicio[]>([]);
  const [customLoaded, setCustomLoaded] = useState(false);

  const sincronizar = useCallback(async () => {
    const custom = await carregarExerciciosPersonalizados();
    setExercicios([...exercicios, ...custom]);
    setCustomLoaded(true);
    setCustomExercises(custom);
  }, []);

  useFocusEffect(
    useCallback(() => {
      sincronizar();
    }, [sincronizar]),
  );

  const find = useCallback(
    (id: string): Exercicio | undefined =>
      exerciciosState.find((e) => e.id === id),
    [exerciciosState],
  );

  const getNome = useCallback(
    (id: string): string => getExercicioNomeMap()[id] || id,
    [customLoaded],
  );

  return {
    exercicios: exerciciosState,
    customLoaded,
    find,
    getNome,
    recarregar: sincronizar,
  };
}
