import {
  inicioDaSemana,
  getSemanaDias,
  calcularVolumeExercicio,
  calcularSeriesExercicio,
} from '../src/utils/stats';

describe('inicioDaSemana', () => {
  it('retorna uma data de segunda-feira', () => {
    const resultado = new Date(inicioDaSemana());
    expect(resultado.getDay()).toBe(1);
  });

  it('retorna data <= hoje', () => {
    const hoje = new Date().toISOString().split('T')[0];
    expect(inicioDaSemana() <= hoje).toBe(true);
  });
});

describe('getSemanaDias', () => {
  it('retorna 7 dias', () => {
    expect(getSemanaDias()).toHaveLength(7);
  });

  it('primeiro dia é segunda-feira', () => {
    const dias = getSemanaDias();
    const primeiro = new Date(dias[0]);
    expect(primeiro.getDay()).toBe(1);
  });

  it('dias são consecutivos', () => {
    const dias = getSemanaDias();
    for (let i = 1; i < dias.length; i++) {
      const anterior = new Date(dias[i - 1]);
      const atual = new Date(dias[i]);
      const diff =
        (atual.getTime() - anterior.getTime()) / (1000 * 60 * 60 * 24);
      expect(diff).toBe(1);
    }
  });
});

describe('calcularVolumeExercicio', () => {
  it('retorna 0 para lista vazia', () => {
    expect(calcularVolumeExercicio([])).toBe(0);
  });

  it('calcula volume de um exercício', () => {
    const exercicios = [{ series: [{ cargas: 10, repeticoes: 12 }] }];
    expect(calcularVolumeExercicio(exercicios)).toBe(120);
  });

  it('calcula volume de múltiplos exercícios', () => {
    const exercicios = [
      {
        series: [
          { cargas: 10, repeticoes: 10 },
          { cargas: 20, repeticoes: 8 },
        ],
      },
      { series: [{ cargas: 30, repeticoes: 6 }] },
    ];
    // 10*10 + 20*8 + 30*6 = 100 + 160 + 180 = 440
    expect(calcularVolumeExercicio(exercicios)).toBe(440);
  });
});

describe('calcularSeriesExercicio', () => {
  it('retorna 0 para lista vazia', () => {
    expect(calcularSeriesExercicio([])).toBe(0);
  });

  it('conta séries corretamente', () => {
    const exercicios = [{ series: [1, 2, 3] }, { series: [1, 2] }];
    expect(calcularSeriesExercicio(exercicios)).toBe(5);
  });
});
