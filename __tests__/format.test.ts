import {
  gerarId,
  formatarDuracao,
  formatarData,
  formatarDuracaoMinutos,
  formatarDataLonga,
  formatarDataCompleta,
} from '../src/utils/format';

describe('gerarId', () => {
  it('retorna string não vazia', () => {
    expect(gerarId()).toBeTruthy();
  });

  it('retorna IDs únicos', () => {
    const ids = new Set(Array.from({ length: 100 }, () => gerarId()));
    expect(ids.size).toBe(100);
  });
});

describe('formatarDuracao', () => {
  it('formata zero segundos', () => {
    expect(formatarDuracao(0)).toBe('00:00');
  });

  it('formata segundos', () => {
    expect(formatarDuracao(45)).toBe('00:45');
  });

  it('formata minutos e segundos', () => {
    expect(formatarDuracao(125)).toBe('02:05');
  });

  it('formata exatamente minutos', () => {
    expect(formatarDuracao(60)).toBe('01:00');
  });
});

describe('formatarDuracaoMinutos', () => {
  it('formata zero minutos', () => {
    expect(formatarDuracaoMinutos(0)).toBe('0min');
  });

  it('formata apenas minutos', () => {
    expect(formatarDuracaoMinutos(45)).toBe('45min');
  });

  it('formata apenas horas', () => {
    expect(formatarDuracaoMinutos(120)).toBe('2h');
  });

  it('formata horas e minutos', () => {
    expect(formatarDuracaoMinutos(90)).toBe('1h 30min');
  });
});

describe('formatarData', () => {
  it('formata data no padrão pt-BR', () => {
    const resultado = formatarData('2026-01-15T12:00:00.000Z');
    expect(resultado).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });
});

describe('formatarDataLonga', () => {
  it('retorna string em maiúsculas', () => {
    const resultado = formatarDataLonga('2026-07-10T12:00:00.000Z');
    expect(resultado).toBe(resultado.toUpperCase());
  });
});

describe('formatarDataCompleta', () => {
  it('formata data com mês por extenso', () => {
    const resultado = formatarDataCompleta('2026-03-15');
    expect(resultado).toContain('março');
    expect(resultado).toContain('2026');
    expect(resultado).toContain('15');
  });

  it('funciona com primeiro dia do mês', () => {
    const resultado = formatarDataCompleta('2026-01-01');
    expect(resultado).toContain('janeiro');
  });
});
