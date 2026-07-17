import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { CardioEntry, TipoCardio } from '../types';
import {
  carregarCardio,
  salvarCardioEntry,
  deletarCardioEntry,
  carregarCardioLocal,
} from '../services/firestoreService';
import { gerarId } from '../utils/storage';

function getHoje(): string {
  return new Date().toISOString().split('T')[0];
}

export const TIPOS_CARDIO: {
  valor: TipoCardio;
  label: string;
  icon: string;
}[] = [
  { valor: 'bicicleta', label: 'Bicicleta', icon: 'bicycle' },
  { valor: 'caminhada', label: 'Caminhada', icon: 'walk' },
  { valor: 'corrida', label: 'Corrida', icon: 'pulse' },
  { valor: 'natacao', label: 'Natação', icon: 'water' },
  { valor: 'pular_corda', label: 'Pular Corda', icon: 'resize' },
  { valor: 'eliptico', label: 'Elíptico', icon: 'ellipse' },
  { valor: 'bike_ergometrica', label: 'Bike Ergométrica', icon: 'bicycle' },
  { valor: 'outro', label: 'Outro', icon: 'add-circle' },
];

export function useCardio() {
  const [entries, setEntries] = useState<CardioEntry[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    try {
      setCarregando(true);
      const dados = await carregarCardioLocal();
      setEntries(dados);
      setCarregando(false);

      const dadosR = await carregarCardio();
      if (JSON.stringify(dados) !== JSON.stringify(dadosR)) setEntries(dadosR);
    } catch {
      setEntries([]);
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  const entriesHoje = entries.filter((e) => e.data === getHoje());

  const adicionar = async (
    tipo: TipoCardio,
    duracaoMinutos: number,
    calorias: number,
    distanciaKm?: number,
    tipoOutro?: string,
    observacao?: string,
  ) => {
    const entry: CardioEntry = {
      id: gerarId(),
      data: getHoje(),
      tipo,
      tipoOutro,
      duracaoMinutos,
      calorias,
      distanciaKm,
      observacao,
      timestamp: new Date().toISOString(),
    };
    await salvarCardioEntry(entry);
    setEntries((prev) => [...prev, entry]);
  };

  const deletar = async (id: string) => {
    await deletarCardioEntry(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  return {
    entries,
    entriesHoje,
    carregando,
    adicionar,
    deletar,
    recarregar: carregar,
  };
}
