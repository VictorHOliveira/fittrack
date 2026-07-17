import { useState, useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import { Treino, TreinoCompleto } from '../types';
import {
  carregarTreinos,
  salvarTreino,
  deletarTreino,
  carregarHistorico,
  salvarHistorico,
  deletarHistorico,
  recalcularRecordesDoHistorico,
  carregarTreinosLocal,
  carregarHistoricoLocal,
  carregarHistoricoDeletados,
  salvarHistoricoDeletados,
} from '../services/firestoreService';

let treinosSynced = false;
let historicoDeletadosLoaded = false;
const historicoDeletados = new Set<string>();

async function ensureDeletadosLoaded() {
  if (!historicoDeletadosLoaded) {
    const deletados = await carregarHistoricoDeletados();
    deletados.forEach((d) => historicoDeletados.add(d));
    historicoDeletadosLoaded = true;
  }
}

export function resetSyncFlags() {
  treinosSynced = false;
}

export function useTreinos() {
  const [treinos, setTreinos] = useState<Treino[]>([]);
  const [carregando, setCarregando] = useState(true);
  const mounted = useRef(false);

  const carregarLocal = useCallback(async () => {
    const dados = await carregarTreinosLocal();
    setTreinos(dados);
    setCarregando(false);
  }, []);

  const sincronizar = useCallback(async () => {
    try {
      setCarregando(true);
      const dados = await carregarTreinosLocal();
      setTreinos(dados);
      setCarregando(false);

      const dadosR = await carregarTreinos();
      treinosSynced = true;
      if (
        dadosR.length >= dados.length &&
        JSON.stringify(dados) !== JSON.stringify(dadosR)
      ) {
        setTreinos(dadosR);
      }
    } catch {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!mounted.current || !treinosSynced) {
        mounted.current = true;
        sincronizar();
      } else {
        carregarLocal();
      }
    }, [sincronizar, carregarLocal]),
  );

  const adicionarOuEditarTreino = async (treino: Treino) => {
    try {
      await salvarTreino(treino);
      await sincronizar();
    } catch {
      // Falha silenciosa
    }
  };

  const deletar = async (id: string) => {
    try {
      await deletarTreino(id);
      await sincronizar();
    } catch {
      // Falha silenciosa
    }
  };

  return {
    treinos,
    carregando,
    adicionarOuEditarTreino,
    deletar,
    recarregar: sincronizar,
  };
}

export function useHistorico() {
  const [historico, setHistorico] = useState<TreinoCompleto[]>([]);
  const [carregando, setCarregando] = useState(true);

  const sincronizar = useCallback(async () => {
    try {
      setCarregando(true);
      const dados = await carregarHistoricoLocal();
      setHistorico(dados);
      setCarregando(false);

      const dadosR = await carregarHistorico();
      if (
        dadosR.length >= dados.length &&
        JSON.stringify(dados) !== JSON.stringify(dadosR)
      ) {
        setHistorico(dadosR);
      }
    } catch {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      sincronizar();
    }, [sincronizar]),
  );

  const salvar = async (treino: TreinoCompleto) => {
    try {
      await salvarHistorico(treino);
      await sincronizar();
    } catch {
      // Falha silenciosa
    }
  };

  const deletar = async (dataExecucao: string) => {
    try {
      await ensureDeletadosLoaded();
      historicoDeletados.add(dataExecucao);
      await salvarHistoricoDeletados(Array.from(historicoDeletados));
      await deletarHistorico(dataExecucao);
      const dados = await carregarHistoricoLocal();
      setHistorico(dados);
      await recalcularRecordesDoHistorico(dados);
    } catch {
      // Falha silenciosa
    }
  };

  return {
    historico,
    carregando,
    salvar,
    deletar,
    recarregar: sincronizar,
  };
}
