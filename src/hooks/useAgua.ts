import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { ConfigAgua, RegistroAguaDiario } from '../types';
import {
  carregarConfigAgua,
  salvarConfigAgua,
  carregarRegistroAgua,
  adicionarCopoAgua,
  carregarConfigAguaLocal,
  carregarRegistroAguaLocal,
} from '../services/firestoreService';
import { CONFIG_AGUA_PADRAO } from '../utils/storage';
import {
  pedirPermissaoNotificacao,
  agendarNotificacaoRegular,
  cancelarTodasNotificacoesAgua,
  setupCategoriaTomei,
  cancelarTodasNags,
  iniciarListenerNag,
} from '../utils/notificacoesAgua';

function getHoje(): string {
  return new Date().toISOString().split('T')[0];
}

export function useAgua() {
  const [config, setConfig] = useState<ConfigAgua>(CONFIG_AGUA_PADRAO);
  const [registros, setRegistros] = useState<RegistroAguaDiario[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    try {
      setCarregando(true);
      const [cfg, regs] = await Promise.all([
        carregarConfigAguaLocal(),
        carregarRegistroAguaLocal(),
      ]);
      setConfig(cfg);
      setRegistros(regs);
      setCarregando(false);

      const [cfgR, regsR] = await Promise.all([
        carregarConfigAgua(),
        carregarRegistroAgua(),
      ]);
      if (JSON.stringify(cfg) !== JSON.stringify(cfgR)) setConfig(cfgR);
      if (JSON.stringify(regs) !== JSON.stringify(regsR)) setRegistros(regsR);
    } catch {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  const registroHoje = registros.find((r) => r.data === getHoje()) || {
    data: getHoje(),
    copos: [],
  };
  const totalMlHoje = registroHoje.copos.reduce((acc, c) => acc + c.ml, 0);
  const totalCoposHoje = registroHoje.copos.length;
  const progresso =
    config.metaDiaria > 0 ? Math.min(totalCoposHoje / config.metaDiaria, 1) : 0;

  const adicionarCopo = useCallback(async () => {
    const atualizado = await adicionarCopoAgua(config.copoMl);
    setRegistros((prev) => {
      const idx = prev.findIndex((r) => r.data === getHoje());
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = atualizado;
        return next;
      }
      return [...prev, atualizado];
    });
    await cancelarTodasNags();
    if (config.notificacaoAtivada) {
      await agendarNotificacaoRegular(config.intervaloMinutos);
    }
  }, [config]);

  const salvarConfig = useCallback(async (novaConfig: ConfigAgua) => {
    setConfig(novaConfig);
    await salvarConfigAgua(novaConfig);

    if (novaConfig.notificacaoAtivada) {
      const permitido = await pedirPermissaoNotificacao();
      if (permitido) {
        await setupCategoriaTomei();
        await agendarNotificacaoRegular(novaConfig.intervaloMinutos);
      } else {
        setConfig((prev) => ({ ...prev, notificacaoAtivada: false }));
        await salvarConfigAgua({ ...novaConfig, notificacaoAtivada: false });
      }
    } else {
      await cancelarTodasNotificacoesAgua();
    }
  }, []);

  useEffect(() => {
    if (!config.notificacaoAtivada) return;

    const limpar = iniciarListenerNag(async () => {
      await adicionarCopo();
    });

    return limpar;
  }, [config.notificacaoAtivada, adicionarCopo]);

  return {
    config,
    registros,
    registroHoje,
    totalMlHoje,
    totalCoposHoje,
    progresso,
    carregando,
    adicionarCopo,
    salvarConfig,
    recarregar: carregar,
  };
}
