import { isExpired, roundQuantity, weightedAverageCost } from '@/features/stock/costing';
import type { Lot, Product, ProductDraft, StockConsumptionInput, StockEntryInput, StockMovement } from '@/types/stock';
import { createUuid } from '@/utils/uuid';

const now = new Date().toISOString();

let products: Product[] = [
  { id: 'demo-ureia', name: 'Ureia', categoryId: null, categoryName: 'Fertilizante', description: 'Fertilizante nitrogenado', manufacturer: 'Yara', supplier: 'Agro Norte', unit: 'kg', minimumStock: 100, currentStock: 240, averageCost: 4.5, notes: null, isActive: true, createdAt: now, updatedAt: now },
  { id: 'demo-npk', name: 'NPK 10-10-10', categoryId: null, categoryName: 'Fertilizante', description: 'Adubo granulado', manufacturer: null, supplier: null, unit: 'kg', minimumStock: 50, currentStock: 80, averageCost: 6.8, notes: null, isActive: true, createdAt: now, updatedAt: now },
  { id: 'demo-glifosato', name: 'Glifosato', categoryId: null, categoryName: 'Defensivo agrícola', description: 'Herbicida', manufacturer: 'Nortox', supplier: null, unit: 'L', minimumStock: 20, currentStock: 12, averageCost: 38, notes: null, isActive: true, createdAt: now, updatedAt: now },
  { id: 'demo-semente', name: 'Semente de Milho', categoryId: null, categoryName: 'Semente', description: 'Híbrido de milho', manufacturer: null, supplier: null, unit: 'kg', minimumStock: 30, currentStock: 60, averageCost: 12, notes: null, isActive: true, createdAt: now, updatedAt: now },
  { id: 'demo-cebola', name: 'Semente de Cebola', categoryId: null, categoryName: 'Semente', description: 'Sementes para plantio de cebola', manufacturer: null, supplier: null, unit: 'kg', minimumStock: 10, currentStock: 25, averageCost: 40, notes: null, isActive: true, createdAt: now, updatedAt: now },
];

let lots: Lot[] = products.map((product, index) => ({
  id: `demo-lot-${index}`, productId: product.id, code: `2026-${String(index + 1).padStart(3, '0')}`,
  manufacturer: product.manufacturer, supplier: product.supplier, expirationKind: 'known', expirationDate: `2026-${String(index + 5).padStart(2, '0')}-12`, currentQuantity: product.currentStock, averageCost: product.averageCost, createdAt: now,
}));

let movements: StockMovement[] = products.slice(0, 3).map((product, index) => ({
  id: `demo-movement-${index}`, productId: product.id, productName: product.name, lotId: lots[index].id, lotCode: lots[index].code,
  movementType: 'entry', quantity: product.currentStock, quantityDelta: product.currentStock, unit: product.unit, occurredAt: now, origin: 'Entrada demonstrativa', notes: null, unitCost: product.averageCost, totalCost: product.currentStock * product.averageCost, reversalOfMovementId: null, isReversed: false,
}));

export async function demoListProducts(): Promise<Product[]> { return products.filter((product) => product.isActive); }
export async function demoGetProduct(productId: string): Promise<Product> { const product = products.find((item) => item.id === productId); if (!product) throw new Error('Produto não encontrado.'); return product; }
export async function demoListLots(productId: string): Promise<Lot[]> { return lots.filter((lot) => lot.productId === productId); }
export async function demoListMovements(productId?: string): Promise<StockMovement[]> { return movements.filter((movement) => !productId || movement.productId === productId).sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)); }

export async function demoCreateProduct(draft: ProductDraft): Promise<Product> {
  const product: Product = { id: createUuid(), name: draft.name.trim(), categoryId: null, categoryName: draft.categoryName, description: draft.description || null, manufacturer: draft.manufacturer || null, supplier: draft.supplier || null, unit: draft.unit.trim(), minimumStock: Number(draft.minimumStock) || 0, currentStock: 0, averageCost: 0, notes: draft.notes || null, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  if (!product.name || !product.unit) throw new Error('Nome e unidade são obrigatórios.');
  products = [...products, product];
  return product;
}

export async function demoUpdateProduct(productId: string, draft: ProductDraft): Promise<Product> {
  const current = await demoGetProduct(productId);
  const updated = { ...current, name: draft.name.trim(), categoryName: draft.categoryName, description: draft.description || null, manufacturer: draft.manufacturer || null, supplier: draft.supplier || null, unit: draft.unit.trim(), minimumStock: Number(draft.minimumStock) || 0, notes: draft.notes || null, updatedAt: new Date().toISOString() };
  products = products.map((product) => product.id === productId ? updated : product);
  return updated;
}

export async function demoRecordEntry(input: StockEntryInput): Promise<void> {
  const product = await demoGetProduct(input.productId);
  const quantity = Number(input.quantity);
  const unitCost = Number(input.unitCost);
  if (!Number.isFinite(quantity) || quantity <= 0) throw new Error('Quantidade deve ser maior que zero.');
  let lot = input.lotId ? lots.find((item) => item.id === input.lotId) : undefined;
  if (!lot) { lot = { id: createUuid(), productId: product.id, code: input.newLot?.code || 'DEMO-001', manufacturer: product.manufacturer, supplier: product.supplier, expirationKind: input.newLot?.expirationKind || 'known', expirationDate: input.newLot?.expirationDate || null, currentQuantity: 0, averageCost: 0, createdAt: new Date().toISOString() }; lots = [...lots, lot]; }
  const nextCost = weightedAverageCost(product.currentStock, product.averageCost, quantity, unitCost);
  lot.currentQuantity = roundQuantity(lot.currentQuantity + quantity); lot.averageCost = weightedAverageCost(lot.currentQuantity - quantity, lot.averageCost, quantity, unitCost);
  products = products.map((item) => item.id === product.id ? { ...item, currentStock: roundQuantity(item.currentStock + quantity), averageCost: nextCost, updatedAt: new Date().toISOString() } : item);
  movements = [{ id: createUuid(), productId: product.id, productName: product.name, lotId: lot.id, lotCode: lot.code, movementType: 'entry', quantity, quantityDelta: quantity, unit: product.unit, occurredAt: input.occurredAt, origin: input.origin || 'Entrada demonstrativa', notes: input.notes || null, unitCost, totalCost: quantity * unitCost, reversalOfMovementId: null, isReversed: false }, ...movements];
}

export async function demoRecordConsumption(input: StockConsumptionInput): Promise<void> {
  const product = await demoGetProduct(input.productId); const quantity = Number(input.quantity);
  if (!Number.isFinite(quantity) || quantity <= 0 || product.currentStock < quantity) throw new Error('Saldo insuficiente para esta demonstração.');
  const lot = lots.find((item) => item.productId === product.id && item.currentQuantity > 0 && (input.type === 'loss' || !isExpired(item.expirationDate, item.expirationKind, input.occurredAt.slice(0, 10))));
  if (!lot || lot.currentQuantity < quantity) throw new Error('Não há saldo suficiente no lote demonstrativo.');
  lot.currentQuantity = roundQuantity(lot.currentQuantity - quantity);
  products = products.map((item) => item.id === product.id ? { ...item, currentStock: roundQuantity(item.currentStock - quantity), updatedAt: new Date().toISOString() } : item);
  movements = [{ id: createUuid(), productId: product.id, productName: product.name, lotId: lot.id, lotCode: lot.code, movementType: input.type, quantity, quantityDelta: -quantity, unit: product.unit, occurredAt: input.occurredAt, origin: input.origin || 'Saída demonstrativa', notes: input.notes || null, unitCost: product.averageCost, totalCost: quantity * product.averageCost, reversalOfMovementId: null, isReversed: false }, ...movements];
}

export async function demoReverseMovement(movementId: string): Promise<void> {
  const movement = movements.find((item) => item.id === movementId);
  if (!movement || movement.isReversed) throw new Error('Movimentação não encontrada ou já estornada.');
  const product = await demoGetProduct(movement.productId); const lot = lots.find((item) => item.id === movement.lotId);
  if (lot) lot.currentQuantity = roundQuantity(lot.currentQuantity - movement.quantityDelta);
  products = products.map((item) => item.id === product.id ? { ...item, currentStock: roundQuantity(item.currentStock - movement.quantityDelta) } : item);
  movements = movements.map((item) => item.id === movementId ? { ...item, isReversed: true } : item);
}
