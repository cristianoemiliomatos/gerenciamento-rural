import { Platform } from 'react-native';
import type { SQLiteDatabase } from 'expo-sqlite';

import { getDatabase } from '@/database/database';
import { demoCreateExpense, demoCreatePlot, demoGetExpense, demoGetPlot, demoListExpenses, demoListPlots, demoUpdateExpense, demoUpdatePlot } from '@/database/demoFarmRepository';
import { getProduct } from '@/database/repositories/stockRepository';
import { createUuid } from '@/utils/uuid';
import { expenseCategories, type Expense, type ExpenseDraft, type ExpenseFilters, type Plot, type PlotDraft } from '@/types/farm';

type PlotRow = Omit<Plot, 'isActive'> & { isActive: number };
type ExpenseRow = Omit<Expense, 'plotName' | 'productName'> & { plotName: string; productName: string | null };
type Queryable = Pick<SQLiteDatabase, 'getFirstAsync'>;

function toPlot(row: PlotRow): Plot { return { ...row, isActive: Boolean(row.isActive) }; }
function requiredText(value: string, label: string): string { const normalized = value.trim(); if (!normalized) throw new Error(`${label} é obrigatório.`); return normalized; }
function validArea(value: number): number { if (!Number.isFinite(value) || value <= 0) throw new Error('A área deve ser maior que zero.'); return value; }
function validAmount(value: number): number { if (!Number.isFinite(value) || value <= 0) throw new Error('O valor deve ser maior que zero.'); return value; }
function validDate(value: string): string { if (Number.isNaN(new Date(value).getTime())) throw new Error('Data do gasto inválida.'); return value; }
function nullable(value?: string): string | null { return value?.trim() || null; }

async function findPlot(database: Queryable, plotId: string): Promise<Plot> {
  const row = await database.getFirstAsync<PlotRow>(`SELECT id, name, area_hectares AS areaHectares, crop, notes, is_active AS isActive, created_at AS createdAt, updated_at AS updatedAt FROM plots WHERE id = ?`, plotId);
  if (!row) throw new Error('Talhão não encontrado.');
  return toPlot(row);
}

async function findExpense(database: Queryable, expenseId: string): Promise<Expense> {
  const row = await database.getFirstAsync<ExpenseRow>(`SELECT e.id, e.description, e.amount, e.expense_date AS expenseDate, e.category, e.plot_id AS plotId, p.name AS plotName, e.product_id AS productId, pr.name AS productName, e.notes, e.created_at AS createdAt, e.updated_at AS updatedAt FROM expenses e JOIN plots p ON p.id = e.plot_id LEFT JOIN products pr ON pr.id = e.product_id WHERE e.id = ?`, expenseId);
  if (!row) throw new Error('Gasto não encontrado.');
  return row;
}

function checkCategory(category: string): asserts category is ExpenseDraft['category'] { if (!expenseCategories.includes(category as ExpenseDraft['category'])) throw new Error('Categoria de gasto inválida.'); }

export async function listPlots(includeInactive = false): Promise<Plot[]> {
  if (Platform.OS === 'web') return demoListPlots();
  const database = await getDatabase();
  const rows = await database.getAllAsync<PlotRow>(`SELECT id, name, area_hectares AS areaHectares, crop, notes, is_active AS isActive, created_at AS createdAt, updated_at AS updatedAt FROM plots WHERE (? = 1 OR is_active = 1) ORDER BY name COLLATE NOCASE`, includeInactive ? 1 : 0);
  return rows.map(toPlot);
}

export async function getPlot(plotId: string): Promise<Plot> {
  if (Platform.OS === 'web') return demoGetPlot(plotId);
  return findPlot(await getDatabase(), plotId);
}

export async function createPlot(draft: PlotDraft): Promise<Plot> {
  const name = requiredText(draft.name, 'Nome do talhão');
  const areaHectares = validArea(draft.areaHectares);
  if (Platform.OS === 'web') return demoCreatePlot({ ...draft, name, areaHectares });
  const database = await getDatabase(); const id = createUuid(); const now = new Date().toISOString();
  try { await database.runAsync(`INSERT INTO plots (id, name, area_hectares, crop, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`, id, name, areaHectares, nullable(draft.crop), nullable(draft.notes), now, now); }
  catch { throw new Error('Não foi possível salvar. Já existe um talhão com este nome?'); }
  return findPlot(database, id);
}

export async function updatePlot(plotId: string, draft: PlotDraft): Promise<Plot> {
  const name = requiredText(draft.name, 'Nome do talhão'); const areaHectares = validArea(draft.areaHectares);
  if (Platform.OS === 'web') return demoUpdatePlot(plotId, { ...draft, name, areaHectares });
  const database = await getDatabase(); await findPlot(database, plotId); const now = new Date().toISOString();
  try { await database.runAsync(`UPDATE plots SET name = ?, area_hectares = ?, crop = ?, notes = ?, updated_at = ? WHERE id = ?`, name, areaHectares, nullable(draft.crop), nullable(draft.notes), now, plotId); }
  catch { throw new Error('Não foi possível atualizar o talhão.'); }
  return findPlot(database, plotId);
}

export async function listExpenses(filters: ExpenseFilters = {}): Promise<Expense[]> {
  if (Platform.OS === 'web') return demoListExpenses(filters);
  const database = await getDatabase(); const where: string[] = []; const params: string[] = [];
  if (filters.plotId) { where.push('e.plot_id = ?'); params.push(filters.plotId); }
  if (filters.productId) { where.push('e.product_id = ?'); params.push(filters.productId); }
  if (filters.category) { where.push('e.category = ?'); params.push(filters.category); }
  if (filters.from) { where.push('e.expense_date >= ?'); params.push(filters.from); }
  if (filters.to) { where.push('e.expense_date <= ?'); params.push(filters.to); }
  const query = `SELECT e.id, e.description, e.amount, e.expense_date AS expenseDate, e.category, e.plot_id AS plotId, p.name AS plotName, e.product_id AS productId, pr.name AS productName, e.notes, e.created_at AS createdAt, e.updated_at AS updatedAt FROM expenses e JOIN plots p ON p.id = e.plot_id LEFT JOIN products pr ON pr.id = e.product_id${where.length ? ` WHERE ${where.join(' AND ')}` : ''} ORDER BY e.expense_date DESC, e.created_at DESC`;
  return database.getAllAsync<ExpenseRow>(query, ...params);
}

export async function getExpense(expenseId: string): Promise<Expense> {
  if (Platform.OS === 'web') return demoGetExpense(expenseId);
  return findExpense(await getDatabase(), expenseId);
}

export async function createExpense(draft: ExpenseDraft): Promise<Expense> {
  const description = requiredText(draft.description, 'Descrição do gasto'); const amount = validAmount(draft.amount); const expenseDate = validDate(draft.expenseDate); checkCategory(draft.category);
  const productName = draft.productId ? (await getProduct(draft.productId)).name : null;
  if (Platform.OS === 'web') return demoCreateExpense({ ...draft, description, amount, expenseDate }, productName);
  const database = await getDatabase(); await findPlot(database, draft.plotId); const id = createUuid(); const now = new Date().toISOString();
  if (draft.productId) await getProduct(draft.productId);
  await database.runAsync(`INSERT INTO expenses (id, description, amount, expense_date, category, plot_id, product_id, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, id, description, amount, expenseDate, draft.category, draft.plotId, draft.productId ?? null, nullable(draft.notes), now, now);
  return findExpense(database, id);
}

export async function updateExpense(expenseId: string, draft: ExpenseDraft): Promise<Expense> {
  const description = requiredText(draft.description, 'Descrição do gasto'); const amount = validAmount(draft.amount); const expenseDate = validDate(draft.expenseDate); checkCategory(draft.category);
  const productName = draft.productId ? (await getProduct(draft.productId)).name : null;
  if (Platform.OS === 'web') return demoUpdateExpense(expenseId, { ...draft, description, amount, expenseDate }, productName);
  const database = await getDatabase(); await findExpense(database, expenseId); await findPlot(database, draft.plotId); const now = new Date().toISOString();
  await database.runAsync(`UPDATE expenses SET description = ?, amount = ?, expense_date = ?, category = ?, plot_id = ?, product_id = ?, notes = ?, updated_at = ? WHERE id = ?`, description, amount, expenseDate, draft.category, draft.plotId, draft.productId ?? null, nullable(draft.notes), now, expenseId);
  return findExpense(database, expenseId);
}
