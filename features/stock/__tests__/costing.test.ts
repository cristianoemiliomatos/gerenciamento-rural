import { isExpired, weightedAverageCost } from '@/features/stock/costing';

describe('custo médio ponderado', () => {
  it('recalcula somente quando há uma entrada', () => {
    expect(weightedAverageCost(10, 20, 5, 30)).toBe(23.333333);
  });

  it('identifica somente lotes com data conhecida já vencida', () => {
    expect(isExpired('2026-01-10', 'known', '2026-01-11T10:00:00.000Z')).toBe(true);
    expect(isExpired(null, 'unknown', '2026-01-11T10:00:00.000Z')).toBe(false);
    expect(isExpired(null, 'not_applicable', '2026-01-11T10:00:00.000Z')).toBe(false);
  });
});
