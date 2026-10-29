export const expenseCategories = [
  'Insumos',
  'Combustível',
  'Manutenção',
  'Mão de obra',
  'Outros',
] as const;

export type ExpenseCategory = (typeof expenseCategories)[number];

export type Plot = {
  id: string;
  name: string;
  areaHectares: number;
  crop: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PlotDraft = {
  name: string;
  areaHectares: number;
  crop?: string;
  notes?: string;
};

export type Expense = {
  id: string;
  description: string;
  amount: number;
  expenseDate: string;
  category: ExpenseCategory;
  plotId: string;
  plotName: string;
  productId: string | null;
  productName: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ExpenseDraft = {
  description: string;
  amount: number;
  expenseDate: string;
  category: ExpenseCategory;
  plotId: string;
  productId?: string;
  notes?: string;
};

export type ExpenseFilters = {
  plotId?: string;
  productId?: string;
  category?: ExpenseCategory;
  from?: string;
  to?: string;
};
