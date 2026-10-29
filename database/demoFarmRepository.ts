import type { Expense, ExpenseDraft, ExpenseFilters, Plot, PlotDraft } from '@/types/farm';
import { createUuid } from '@/utils/uuid';

const now = new Date().toISOString();

let plots: Plot[] = [
  { id: 'demo-plot-1', name: 'Talhão de cebola', areaHectares: 2.5, crop: 'Cebola', notes: 'Área próxima ao galpão', isActive: true, createdAt: now, updatedAt: now },
  { id: 'demo-plot-2', name: 'Talhão de milho', areaHectares: 5.2, crop: 'Milho', notes: null, isActive: true, createdAt: now, updatedAt: now },
  { id: 'demo-plot-3', name: 'Talhão de soja', areaHectares: 8.7, crop: 'Soja', notes: null, isActive: true, createdAt: now, updatedAt: now },
];

let expenses: Expense[] = [
  { id: 'demo-expense-1', description: 'Sementes para plantio', amount: 1000, expenseDate: '2026-10-20', category: 'Insumos', plotId: 'demo-plot-1', plotName: 'Talhão de cebola', productId: 'demo-cebola', productName: 'Semente de Cebola', notes: 'Compra demonstrativa', createdAt: now, updatedAt: now },
  { id: 'demo-expense-2', description: 'Abastecimento do trator', amount: 230, expenseDate: '2026-10-18', category: 'Combustível', plotId: 'demo-plot-2', plotName: 'Talhão de milho', productId: null, productName: null, notes: null, createdAt: now, updatedAt: now },
  { id: 'demo-expense-3', description: 'Aplicação de defensivo', amount: 220, expenseDate: '2026-10-12', category: 'Insumos', plotId: 'demo-plot-3', plotName: 'Talhão de soja', productId: 'demo-glifosato', productName: 'Glifosato', notes: null, createdAt: now, updatedAt: now },
];

export async function demoListPlots(): Promise<Plot[]> { return plots.filter((plot) => plot.isActive); }

export async function demoGetPlot(plotId: string): Promise<Plot> {
  const plot = plots.find((item) => item.id === plotId);
  if (!plot) throw new Error('Talhão não encontrado.');
  return plot;
}

export async function demoCreatePlot(draft: PlotDraft): Promise<Plot> {
  if (!draft.name.trim()) throw new Error('Nome do talhão é obrigatório.');
  if (!Number.isFinite(draft.areaHectares) || draft.areaHectares <= 0) throw new Error('A área deve ser maior que zero.');
  const plot: Plot = { id: createUuid(), name: draft.name.trim(), areaHectares: draft.areaHectares, crop: draft.crop?.trim() || null, notes: draft.notes?.trim() || null, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  plots = [...plots, plot];
  return plot;
}

export async function demoUpdatePlot(plotId: string, draft: PlotDraft): Promise<Plot> {
  const current = await demoGetPlot(plotId);
  const updated = { ...current, name: draft.name.trim(), areaHectares: draft.areaHectares, crop: draft.crop?.trim() || null, notes: draft.notes?.trim() || null, updatedAt: new Date().toISOString() };
  plots = plots.map((plot) => plot.id === plotId ? updated : plot);
  expenses = expenses.map((expense) => expense.plotId === plotId ? { ...expense, plotName: updated.name, updatedAt: new Date().toISOString() } : expense);
  return updated;
}

export async function demoListExpenses(filters: ExpenseFilters = {}): Promise<Expense[]> {
  return expenses.filter((expense) => (!filters.plotId || expense.plotId === filters.plotId) && (!filters.productId || expense.productId === filters.productId) && (!filters.category || expense.category === filters.category) && (!filters.from || expense.expenseDate >= filters.from) && (!filters.to || expense.expenseDate <= filters.to)).sort((a, b) => b.expenseDate.localeCompare(a.expenseDate));
}

export async function demoGetExpense(expenseId: string): Promise<Expense> {
  const expense = expenses.find((item) => item.id === expenseId);
  if (!expense) throw new Error('Gasto não encontrado.');
  return expense;
}

export async function demoCreateExpense(draft: ExpenseDraft, productName: string | null): Promise<Expense> {
  const plot = await demoGetPlot(draft.plotId);
  if (!draft.description.trim()) throw new Error('Descrição do gasto é obrigatória.');
  if (!Number.isFinite(draft.amount) || draft.amount <= 0) throw new Error('O valor deve ser maior que zero.');
  const expense: Expense = { id: createUuid(), description: draft.description.trim(), amount: draft.amount, expenseDate: draft.expenseDate, category: draft.category, plotId: plot.id, plotName: plot.name, productId: draft.productId || null, productName, notes: draft.notes?.trim() || null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  expenses = [expense, ...expenses];
  return expense;
}

export async function demoUpdateExpense(expenseId: string, draft: ExpenseDraft, productName: string | null): Promise<Expense> {
  const current = await demoGetExpense(expenseId);
  const plot = await demoGetPlot(draft.plotId);
  const updated = { ...current, description: draft.description.trim(), amount: draft.amount, expenseDate: draft.expenseDate, category: draft.category, plotId: plot.id, plotName: plot.name, productId: draft.productId || null, productName, notes: draft.notes?.trim() || null, updatedAt: new Date().toISOString() };
  expenses = expenses.map((expense) => expense.id === expenseId ? updated : expense);
  return updated;
}
