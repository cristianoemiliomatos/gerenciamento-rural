import { StockRuleError } from '@/types/stock';

const precision = 6;

export function roundQuantity(value: number): number {
  return Number(value.toFixed(precision));
}

export function weightedAverageCost(
  currentQuantity: number,
  currentAverageCost: number,
  entryQuantity: number,
  entryUnitCost: number,
): number {
  if (currentQuantity < 0 || entryQuantity <= 0 || currentAverageCost < 0 || entryUnitCost < 0) {
    throw new StockRuleError('As quantidades e os custos devem ser valores válidos.');
  }

  const finalQuantity = currentQuantity + entryQuantity;
  return roundQuantity(((currentQuantity * currentAverageCost) + (entryQuantity * entryUnitCost)) / finalQuantity);
}

export function isExpired(expirationDate: string | null, expirationKind: string, referenceDate: string): boolean {
  return expirationKind === 'known'
    && expirationDate !== null
    && expirationDate < referenceDate.slice(0, 10);
}
