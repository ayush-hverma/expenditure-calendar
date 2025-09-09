// Local storage utilities for expense data persistence

export interface Expense {
  id: string;
  date: string;
  amount: number;
  category: 'food' | 'bills' | 'travel' | 'shopping' | 'entertainment' | 'other';
  description: string;
  isRecurring?: boolean;
  recurringType?: 'weekly' | 'monthly' | 'yearly';
}

export interface Budget {
  id: string;
  type: 'weekly' | 'monthly';
  amount: number;
  category?: string;
  startDate: string;
}

const EXPENSES_KEY = 'manya_expenses';
const BUDGETS_KEY = 'manya_budgets';

// Expense management
export const saveExpenses = (expenses: Expense[]): void => {
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
};

export const loadExpenses = (): Expense[] => {
  const data = localStorage.getItem(EXPENSES_KEY);
  return data ? JSON.parse(data) : [];
};

export const addExpense = (expense: Omit<Expense, 'id'>): Expense => {
  const expenses = loadExpenses();
  const newExpense: Expense = {
    ...expense,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  };
  expenses.push(newExpense);
  saveExpenses(expenses);
  return newExpense;
};

export const updateExpense = (id: string, updates: Partial<Expense>): void => {
  const expenses = loadExpenses();
  const index = expenses.findIndex(exp => exp.id === id);
  if (index !== -1) {
    expenses[index] = { ...expenses[index], ...updates };
    saveExpenses(expenses);
  }
};

export const deleteExpense = (id: string): void => {
  const expenses = loadExpenses();
  const filtered = expenses.filter(exp => exp.id !== id);
  saveExpenses(filtered);
};

// Budget management
export const saveBudgets = (budgets: Budget[]): void => {
  localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
};

export const loadBudgets = (): Budget[] => {
  const data = localStorage.getItem(BUDGETS_KEY);
  return data ? JSON.parse(data) : [];
};

export const addBudget = (budget: Omit<Budget, 'id'>): Budget => {
  const budgets = loadBudgets();
  const newBudget: Budget = {
    ...budget,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  };
  budgets.push(newBudget);
  saveBudgets(budgets);
  return newBudget;
};

// Utility functions
export const getExpensesForDate = (date: string): Expense[] => {
  const expenses = loadExpenses();
  return expenses.filter(exp => exp.date === date);
};

export const getExpensesForMonth = (year: number, month: number): Expense[] => {
  const expenses = loadExpenses();
  return expenses.filter(exp => {
    const expenseDate = new Date(exp.date);
    return expenseDate.getFullYear() === year && expenseDate.getMonth() === month;
  });
};

export const getTotalForDate = (date: string): number => {
  const expenses = getExpensesForDate(date);
  return expenses.reduce((total, exp) => total + exp.amount, 0);
};

export const getTotalForMonth = (year: number, month: number): number => {
  const expenses = getExpensesForMonth(year, month);
  return expenses.reduce((total, exp) => total + exp.amount, 0);
};

export const getCategoryTotalsForMonth = (year: number, month: number): Record<string, number> => {
  const expenses = getExpensesForMonth(year, month);
  const totals: Record<string, number> = {};
  
  expenses.forEach(exp => {
    totals[exp.category] = (totals[exp.category] || 0) + exp.amount;
  });
  
  return totals;
};