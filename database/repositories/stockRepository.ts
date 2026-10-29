import type { SQLiteDatabase } from 'expo-sqlite';
import { Platform } from 'react-native';

import { getDatabase } from '@/database/database';
import { demoCreateProduct, demoGetProduct, demoListLots, demoListMovements, demoListProducts, demoRecordConsumption, demoRecordEntry, demoReverseMovement, demoUpdateProduct } from '@/database/demoRepository';
import { isExpired, roundQuantity, weightedAverageCost } from '@/features/stock/costing';
import {
  type Lot,
  type Product,
  type ProductDraft,
  type StockConsumptionInput,
  type StockEntryInput,
  type StockMovement,
  StockRuleError,
} from '@/types/stock';
import { createUuid } from '@/utils/uuid';

type ProductRow = Omit<Product, 'isActive'> & { isActive: number };
type LotRow = Lot;
type MovementRow = Omit<StockMovement, 'isReversed'> & { isReversed: number };
type Queryable = Pick<SQLiteDatabase, 'getFirstAsync'>;

function toProduct(row: ProductRow): Product {
  return { ...row, isActive: Boolean(row.isActive) };
}

function toMovement(row: MovementRow): StockMovement {
  return { ...row, isReversed: Boolean(row.isReversed) };
}

function requiredText(value: string, label: string): string {
  const normalized = value.trim();
  if (!normalized) throw new StockRuleError(`${label} é obrigatório.`);
  return normalized;
}

function positiveNumber(value: number, label: string, allowZero = false): number {
  if (!Number.isFinite(value) || (allowZero ? value < 0 : value <= 0)) {
    throw new StockRuleError(`${label} deve ser ${allowZero ? 'maior ou igual a zero' : 'maior que zero'}.`);
  }
  return value;
}

function validDate(value: string, label: string): string {
  if (Number.isNaN(new Date(value).getTime())) throw new StockRuleError(`${label} inválida.`);
  return value;
}

function asNullable(value?: string): string | null {
  const normalized = value?.trim();
  return normalized || null;
}

async function findProduct(database: Queryable, productId: string): Promise<Product> {
  const product = await database.getFirstAsync<ProductRow>(`
    SELECT p.id, p.name, p.category_id AS categoryId, c.name AS categoryName,
      p.description, p.manufacturer, p.supplier, p.unit,
      p.minimum_stock AS minimumStock, p.current_stock AS currentStock,
      p.average_cost AS averageCost, p.notes, p.is_active AS isActive,
      p.created_at AS createdAt, p.updated_at AS updatedAt
    FROM products p
    LEFT JOIN product_categories c ON c.id = p.category_id
    WHERE p.id = ?
  `, productId);
  if (!product) throw new StockRuleError('Produto não encontrado.');
  return toProduct(product);
}

async function findLot(database: Queryable, lotId: string, productId: string): Promise<Lot> {
  const lot = await database.getFirstAsync<LotRow>(`
    SELECT id, product_id AS productId, code, manufacturer, supplier,
      expiration_kind AS expirationKind, expiration_date AS expirationDate,
      current_quantity AS currentQuantity, average_cost AS averageCost, created_at AS createdAt
    FROM lots WHERE id = ? AND product_id = ?
  `, lotId, productId);
  if (!lot) throw new StockRuleError('Lote não pertence ao produto informado.');
  return lot;
}

async function categoryIdForName(database: Queryable, categoryName: string): Promise<string> {
  const category = await database.getFirstAsync<{ id: string }>(
    'SELECT id FROM product_categories WHERE name = ? AND is_active = 1',
    categoryName,
  );
  if (!category) throw new StockRuleError('Categoria inválida.');
  return category.id;
}

export async function createProduct(draft: ProductDraft): Promise<Product> {
  if (Platform.OS === 'web') return demoCreateProduct(draft);
  const database = await getDatabase();
  const name = requiredText(draft.name, 'Nome do produto');
  const unit = requiredText(draft.unit, 'Unidade de medida');
  const minimumStock = positiveNumber(draft.minimumStock, 'Estoque mínimo', true);
  const now = new Date().toISOString();
  const id = createUuid();

  try {
    await database.withExclusiveTransactionAsync(async (transaction) => {
      const categoryId = await categoryIdForName(transaction, draft.categoryName);
      await transaction.runAsync(`
        INSERT INTO products (
          id, name, category_id, description, manufacturer, supplier, unit,
          minimum_stock, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, id, name, categoryId, asNullable(draft.description), asNullable(draft.manufacturer),
      asNullable(draft.supplier), unit, minimumStock, asNullable(draft.notes), now, now);
    });
  } catch (error) {
    if (error instanceof StockRuleError) throw error;
    throw new StockRuleError('Não foi possível salvar. Já existe um produto com este nome?');
  }

  return findProduct(database, id);
}

export async function updateProduct(productId: string, draft: ProductDraft): Promise<Product> {
  if (Platform.OS === 'web') return demoUpdateProduct(productId, draft);
  const database = await getDatabase();
  const name = requiredText(draft.name, 'Nome do produto');
  const unit = requiredText(draft.unit, 'Unidade de medida');
  const minimumStock = positiveNumber(draft.minimumStock, 'Estoque mínimo', true);

  try {
    await database.withExclusiveTransactionAsync(async (transaction) => {
      await findProduct(transaction, productId);
      const categoryId = await categoryIdForName(transaction, draft.categoryName);
      await transaction.runAsync(`
        UPDATE products SET name = ?, category_id = ?, description = ?, manufacturer = ?, supplier = ?,
          unit = ?, minimum_stock = ?, notes = ?, updated_at = ?
        WHERE id = ?
      `, name, categoryId, asNullable(draft.description), asNullable(draft.manufacturer),
      asNullable(draft.supplier), unit, minimumStock, asNullable(draft.notes), new Date().toISOString(), productId);
    });
  } catch (error) {
    if (error instanceof StockRuleError) throw error;
    throw new StockRuleError('Não foi possível atualizar. Verifique se o nome já não está em uso.');
  }
  return findProduct(database, productId);
}

export async function listProducts(includeInactive = false): Promise<Product[]> {
  if (Platform.OS === 'web') return demoListProducts();
  const database = await getDatabase();
  const products = await database.getAllAsync<ProductRow>(`
    SELECT p.id, p.name, p.category_id AS categoryId, c.name AS categoryName,
      p.description, p.manufacturer, p.supplier, p.unit,
      p.minimum_stock AS minimumStock, p.current_stock AS currentStock,
      p.average_cost AS averageCost, p.notes, p.is_active AS isActive,
      p.created_at AS createdAt, p.updated_at AS updatedAt
    FROM products p LEFT JOIN product_categories c ON c.id = p.category_id
    WHERE (? = 1 OR p.is_active = 1)
    ORDER BY p.name COLLATE NOCASE
  `, includeInactive ? 1 : 0);
  return products.map(toProduct);
}

export async function getProduct(productId: string): Promise<Product> {
  if (Platform.OS === 'web') return demoGetProduct(productId);
  return findProduct(await getDatabase(), productId);
}

export async function listLots(productId: string): Promise<Lot[]> {
  if (Platform.OS === 'web') return demoListLots(productId);
  const database = await getDatabase();
  return database.getAllAsync<LotRow>(`
    SELECT id, product_id AS productId, code, manufacturer, supplier,
      expiration_kind AS expirationKind, expiration_date AS expirationDate,
      current_quantity AS currentQuantity, average_cost AS averageCost, created_at AS createdAt
    FROM lots WHERE product_id = ?
    ORDER BY CASE expiration_kind WHEN 'known' THEN 0 WHEN 'not_applicable' THEN 1 ELSE 2 END,
      expiration_date ASC, created_at ASC
  `, productId);
}

export async function listMovements(productId?: string): Promise<StockMovement[]> {
  if (Platform.OS === 'web') return demoListMovements(productId);
  const database = await getDatabase();
  const movements = await database.getAllAsync<MovementRow>(`
    SELECT m.id, m.product_id AS productId, p.name AS productName, m.lot_id AS lotId,
      l.code AS lotCode, m.movement_type AS movementType, m.quantity,
      m.quantity_delta AS quantityDelta, m.unit, m.occurred_at AS occurredAt,
      m.origin, m.notes, m.unit_cost AS unitCost, m.total_cost AS totalCost,
      m.reversal_of_movement_id AS reversalOfMovementId, m.is_reversed AS isReversed
    FROM stock_movements m
    JOIN products p ON p.id = m.product_id
    LEFT JOIN lots l ON l.id = m.lot_id
    WHERE (? IS NULL OR m.product_id = ?)
    ORDER BY m.occurred_at DESC, m.created_at DESC
  `, productId ?? null, productId ?? null);
  return movements.map(toMovement);
}

export async function recordEntry(input: StockEntryInput): Promise<void> {
  if (Platform.OS === 'web') return demoRecordEntry(input);
  const database = await getDatabase();
  const quantity = positiveNumber(input.quantity, 'Quantidade');
  const unitCost = positiveNumber(input.unitCost, 'Custo unitário', true);
  const occurredAt = validDate(input.occurredAt, 'Data da movimentação');

  await database.withExclusiveTransactionAsync(async (transaction) => {
    const product = await findProduct(transaction, input.productId);
    let lot: Lot;

    if (input.lotId) {
      lot = await findLot(transaction, input.lotId, product.id);
    } else {
      if (!input.newLot) throw new StockRuleError('Informe um lote para registrar a entrada.');
      const expirationKind = input.newLot.expirationKind;
      const expirationDate = asNullable(input.newLot.expirationDate);
      if (expirationKind === 'known' && !expirationDate) throw new StockRuleError('Informe a validade do lote.');
      if (expirationDate) validDate(expirationDate, 'Data de validade');
      const now = new Date().toISOString();
      lot = {
        id: createUuid(), productId: product.id, code: asNullable(input.newLot.code),
        manufacturer: asNullable(input.newLot.manufacturer) ?? product.manufacturer,
        supplier: asNullable(input.newLot.supplier) ?? product.supplier,
        expirationKind, expirationDate, currentQuantity: 0, averageCost: 0, createdAt: now,
      };
      await transaction.runAsync(`
        INSERT INTO lots (id, product_id, code, manufacturer, supplier, expiration_kind, expiration_date, current_quantity, average_cost, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?)
      `, lot.id, lot.productId, lot.code, lot.manufacturer, lot.supplier, lot.expirationKind,
      lot.expirationDate, now, now);
    }

    const nextProductCost = weightedAverageCost(product.currentStock, product.averageCost, quantity, unitCost);
    const nextLotCost = weightedAverageCost(lot.currentQuantity, lot.averageCost, quantity, unitCost);
    const now = new Date().toISOString();
    await transaction.runAsync(
      'UPDATE lots SET current_quantity = ?, average_cost = ?, updated_at = ? WHERE id = ?',
      roundQuantity(lot.currentQuantity + quantity), nextLotCost, now, lot.id,
    );
    await transaction.runAsync(
      'UPDATE products SET current_stock = ?, average_cost = ?, updated_at = ? WHERE id = ?',
      roundQuantity(product.currentStock + quantity), nextProductCost, now, product.id,
    );
    await transaction.runAsync(`
      INSERT INTO stock_movements (id, product_id, lot_id, movement_type, quantity, quantity_delta, unit, occurred_at, origin, notes, unit_cost, total_cost, created_at)
      VALUES (?, ?, ?, 'entry', ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, createUuid(), product.id, lot.id, quantity, quantity, product.unit, occurredAt,
    input.origin?.trim() || 'Entrada manual', asNullable(input.notes), unitCost, roundQuantity(quantity * unitCost), now);
  });
}

export async function recordConsumption(input: StockConsumptionInput): Promise<void> {
  if (Platform.OS === 'web') return demoRecordConsumption(input);
  const database = await getDatabase();
  const quantity = positiveNumber(input.quantity, 'Quantidade');
  const occurredAt = validDate(input.occurredAt, 'Data da movimentação');
  const referenceDay = occurredAt.slice(0, 10);

  await database.withExclusiveTransactionAsync(async (transaction) => {
    const product = await findProduct(transaction, input.productId);
    if (product.currentStock < quantity) throw new StockRuleError('Saldo insuficiente para registrar esta movimentação.');

    let lots: Lot[];
    if (input.lotId) {
      lots = [await findLot(transaction, input.lotId, product.id)];
    } else {
      lots = await transaction.getAllAsync<LotRow>(`
        SELECT id, product_id AS productId, code, manufacturer, supplier,
          expiration_kind AS expirationKind, expiration_date AS expirationDate,
          current_quantity AS currentQuantity, average_cost AS averageCost, created_at AS createdAt
        FROM lots WHERE product_id = ? AND current_quantity > 0
        ORDER BY CASE expiration_kind WHEN 'known' THEN 0 WHEN 'not_applicable' THEN 1 ELSE 2 END,
          expiration_date ASC, created_at ASC
      `, product.id);
    }

    let remaining = quantity;
    const selectedLots = input.type === 'loss' ? lots : lots.filter((lot) => !isExpired(lot.expirationDate, lot.expirationKind, referenceDay));
    if (selectedLots.reduce((sum, lot) => sum + lot.currentQuantity, 0) < quantity) {
      throw new StockRuleError(input.type === 'loss'
        ? 'Os lotes informados não possuem saldo suficiente.'
        : 'Não há saldo suficiente em lotes válidos para esta saída.');
    }

    const now = new Date().toISOString();
    for (const lot of selectedLots) {
      if (remaining <= 0) break;
      const consumed = Math.min(remaining, lot.currentQuantity);
      const lotUpdate = await transaction.runAsync(
        'UPDATE lots SET current_quantity = ?, updated_at = ? WHERE id = ? AND current_quantity >= ?',
        roundQuantity(lot.currentQuantity - consumed), now, lot.id, consumed,
      );
      if (lotUpdate.changes !== 1) throw new StockRuleError('O saldo do lote foi alterado. Tente novamente.');
      await transaction.runAsync(`
        INSERT INTO stock_movements (id, product_id, lot_id, movement_type, quantity, quantity_delta, unit, occurred_at, origin, notes, unit_cost, total_cost, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, createUuid(), product.id, lot.id, input.type, consumed, -consumed, product.unit, occurredAt,
      input.origin?.trim() || (input.type === 'loss' ? 'Perda manual' : 'Saída manual'),
      asNullable(input.notes), product.averageCost, roundQuantity(consumed * product.averageCost), now);
      remaining = roundQuantity(remaining - consumed);
    }

    const productUpdate = await transaction.runAsync(
      'UPDATE products SET current_stock = ?, updated_at = ? WHERE id = ? AND current_stock >= ?',
      roundQuantity(product.currentStock - quantity), now, product.id, quantity,
    );
    if (productUpdate.changes !== 1) throw new StockRuleError('O saldo do produto foi alterado. Tente novamente.');
  });
}

export async function reverseMovement(movementId: string, occurredAt = new Date().toISOString()): Promise<void> {
  if (Platform.OS === 'web') return demoReverseMovement(movementId);
  const database = await getDatabase();
  validDate(occurredAt, 'Data do estorno');

  await database.withExclusiveTransactionAsync(async (transaction) => {
    const movement = await transaction.getFirstAsync<MovementRow>(`
      SELECT m.id, m.product_id AS productId, p.name AS productName, m.lot_id AS lotId,
        l.code AS lotCode, m.movement_type AS movementType, m.quantity,
        m.quantity_delta AS quantityDelta, m.unit, m.occurred_at AS occurredAt,
        m.origin, m.notes, m.unit_cost AS unitCost, m.total_cost AS totalCost,
        m.reversal_of_movement_id AS reversalOfMovementId, m.is_reversed AS isReversed
      FROM stock_movements m JOIN products p ON p.id = m.product_id
      LEFT JOIN lots l ON l.id = m.lot_id WHERE m.id = ?
    `, movementId);
    if (!movement) throw new StockRuleError('Movimentação não encontrada.');
    if (movement.isReversed) throw new StockRuleError('Esta movimentação já foi estornada.');
    if (!movement.lotId) throw new StockRuleError('Não é possível estornar uma movimentação sem lote.');

    const product = await findProduct(transaction, movement.productId);
    const lot = await findLot(transaction, movement.lotId, movement.productId);
    const delta = -movement.quantityDelta;
    if (delta < 0 && (product.currentStock < -delta || lot.currentQuantity < -delta)) {
      throw new StockRuleError('Não é possível estornar: o saldo disponível já foi consumido.');
    }

    const now = new Date().toISOString();
    await transaction.runAsync('UPDATE lots SET current_quantity = ?, updated_at = ? WHERE id = ?', roundQuantity(lot.currentQuantity + delta), now, lot.id);
    await transaction.runAsync('UPDATE products SET current_stock = ?, updated_at = ? WHERE id = ?', roundQuantity(product.currentStock + delta), now, product.id);
    await transaction.runAsync('UPDATE stock_movements SET is_reversed = 1 WHERE id = ?', movement.id);
    await transaction.runAsync(`
      INSERT INTO stock_movements (id, product_id, lot_id, movement_type, quantity, quantity_delta, unit, occurred_at, origin, notes, unit_cost, total_cost, reversal_of_movement_id, created_at)
      VALUES (?, ?, ?, 'reversal', ?, ?, ?, ?, 'Estorno', ?, ?, ?, ?, ?)
    `, createUuid(), product.id, lot.id, movement.quantity, delta, product.unit, occurredAt,
    `Estorno de movimentação ${movement.id.slice(0, 8)}`, movement.unitCost, movement.totalCost, movement.id, now);
  });
}
