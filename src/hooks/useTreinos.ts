import { useState, useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import { Treino, TreinoCompleto } from '../types';
import { carregarTreinos, salvarTreino, deletarTreino, carregarHistorico, salvarHistorico, carregarTreinosLocal, carregarHistoricoLocal } from '../services/firestoreService';

let treinosSynced = false;
let historicoSynced = false;

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
      if (dadosR.length >= dados.length && JSON.stringify(dados) !== JSON.stringify(dadosR)) {
        setTreinos(dadosR);
      }
    } catch (e) {
      console.warn('Erro ao carregar treinos:', e);
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
    }, [sincronizar, carregarLocal])
  );

  const adicionarOuEditarTreino = async (treino: Treino) => {
    try {
      await salvarTreino(treino);
      await sincronizar();
    } catch (e) {
      console.warn('Erro ao salvar treino:', e);
    }
  };

  const deletar = async (id: string) => {
    try {
      await deletarTreino(id);
      await sincronizar();
    } catch (e) {
      console.warn('Erro ao deletar treino:', e);
    }
  };

  return { treinos, carregando, adicionarOuEditarTreino, deletar, recarregar: sincronizar };
}

export function useHistorico() {
  const [historico, setHistorico] = useState<TreinoCompleto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const mounted = useRef(false);

  const carregarLocal = useCallback(async () => {
    const dados = await carregarHistoricoLocal();
    setHistorico(dados);
    setCarregando(false);
  }, []);

  const sincronizar = useCallback(async () => {
    try {
      setCarregando(true);
      const dados = await carregarHistoricoLocal();
      setHistorico(dados);
      setCarregando(false);

      const dadosR = await carregarHistorico();
      historicoSynced = true;
      if (dadosR.length >= dados.length && JSON.stringify(dados) !== JSON.stringify(dadosR)) {
        setHistorico(dadosR);
      }
    } catch (e) {
      console.warn('Erro ao carregar histórico:', e);
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!mounted.current || !historicoSynced) {
        mounted.current = true;
        sincronizar();
      } else {
        carregarLocal();
      }
    }, [sincronizar, carregarLocal])
  );

  const salvar = async (treino: TreinoCompleto) => {
    try {
      await salvarHistorico(treino);
      await sincronizar();
    } catch (e) {
      console.warn('Erro ao salvar histórico:', e);
    }
  };

  return { historico, carregando, salvar, recarregar: sincronizar };
}
