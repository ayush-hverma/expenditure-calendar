// Compatibility layer for synchronous storage operations
// This provides sync versions of async Supabase operations for components that need immediate data

import { Expense, Budget } from './storage';

// In-memory cache for better performance
let expensesCache: Expense[] = [];
let budgetsCache: Budget[] = [];
let lastCacheUpdate = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Import async functions
import {
  loadExpenses,
  loadBudgets,
  getExpensesForDate as getExpensesForDateAsync,
  getExpensesForMonth as getExpensesForMonthAsync,
  getTotalForDate as getTotalForDateAsync,
  getTotalForMonth as getTotalForMonthAsync,
  getCategoryTotalsForMonth as getCategoryTotalsForMonthAsync,
} from './storage';

// Initialize cache
const initCache = async () => {
  if (Date.now() - lastCacheUpdate > CACHE_DURATION) {
    try {
      expensesCache = await loadExpenses();
      budgetsCache = await loadBudgets();
      lastCacheUpdate = Date.now();
    } catch (error) {
      console.error('Error initializing cache:', error);
    }
  }
};

// Call initCache immediately
initCache();

// Export synchronous versions using cache
export const getExpensesForDate = (date: string): Expense[] => {
  return expensesCache.filter(exp => exp.date === date);
};

export const getExpensesForMonth = (year: number, month: number): Expense[] => {
  return expensesCache.filter(exp => {
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

export const loadBudgetsSync = (): Budget[] => {
  return budgetsCache;
};

// Refresh cache function to be called after operations
export const refreshCache = async () => {
  try {
    expensesCache = await loadExpenses();
    budgetsCache = await loadBudgets();
    lastCacheUpdate = Date.now();
  } catch (error) {
    console.error('Error refreshing cache:', error);
  }
};

// Auto-refresh cache every 30 seconds
setInterval(refreshCache, 30000);