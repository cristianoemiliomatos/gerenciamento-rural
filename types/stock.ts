export const productCategories = [
  'Defensivo agrícola',
  'Fertilizante',
  'Semente',
  'Produto biológico',
  'Outro',
] as const;

export type ProductCategoryName = (typeof productCategories)[number];
export type ExpirationKind = 'known' | 'unknown' | 'not_applicable';
export type StockMovementType = 'entry' | 'exit' | 'loss' | 'reversal';

export type Product = {
  id: string;
  name: string;
  categoryId: string | null;
  categoryName: string | null;
  description: string | null;
  manufacturer: string | null;
  supplier: string | null;
  unit: string;
  minimumStock: number;
  currentStock: number;
  averageCost: number;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Lot = {
  id: string;
  productId: string;
  code: string | null;
  manufacturer: string | null;
  supplier: string | null;
  expirationKind: ExpirationKind;
  expirationDate: string | null;
  currentQuantity: number;
  averageCost: number;
  createdAt: string;
};

export type StockMovement = {
  id: string;
  productId: string;
  productName: string;
  lotId: string | null;
  lotCode: string | null;
  movementType: StockMovementType;
  quantity: number;
  quantityDelta: number;
  unit: string;
  occurredAt: string;
  origin: string;
  notes: string | null;
  unitCost: number;
  totalCost: number;
  reversalOfMovementId: string | null;
  isReversed: boolean;
};

export type ProductDraft = {
  name: string;
  categoryName: ProductCategoryName;
  description?: string;
  manufacturer?: string;
  supplier?: string;
  unit: string;
  minimumStock: number;
  notes?: string;
};

export type NewLotDraft = {
  code?: string;
  manufacturer?: string;
  supplier?: string;
  expirationKind: ExpirationKind;
  expirationDate?: string;
};

export type StockEntryInput = {
  productId: string;
  quantity: number;
  unitCost: number;
  occurredAt: string;
  notes?: string;
  origin?: string;
  lotId?: string;
  newLot?: NewLotDraft;
};

export type StockConsumptionInput = {
  productId: string;
  quantity: number;
  occurredAt: string;
  type: 'exit' | 'loss';
  notes?: string;
  origin?: string;
  lotId?: string;
};

export class StockRuleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StockRuleError';
  }
}
