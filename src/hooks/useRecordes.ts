import { useState, useEffect, useCallback } from 'react';
import { RecordesMap } from '../types';
import { carregarRecordes } from '../services/firestoreService';

export function useRecordes() {
  const [recordes, setRecordes] = useState<RecordesMap>({});
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    try {
      setCarregando(true);
      const dados = await carregarRecordes();
      setRecordes(dados);
    } catch {
      setRecordes({});
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregar();
  }, [carregar]);

  return { recordes, carregando, recarregar: carregar };
}
