// state.js — State AnggaranKita: muat, simpan, CRUD, dan turunan angka.
// Satu sumber kebenaran: semua halaman membaca dari objek state yang sama.

import { FAMILY, INITIAL_INCOME, INITIAL_CATEGORIES, INITIAL_EXPENSES, HISTORY, INITIAL_GOALS } from './data.js';

const STORAGE_KEY = 'anggarankita-v1';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function defaultState() {
  return {
    family: clone(FAMILY),
    income: clone(INITIAL_INCOME),
    categories: clone(INITIAL_CATEGORIES),
    expenses: clone(INITIAL_EXPENSES),
    goals: clone(INITIAL_GOALS)
  };
}

let memoryFallback = null;

export function loadState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.categories) || !Array.isArray(parsed.expenses)) {
      return defaultState();
    }
    return parsed;
  } catch (err) {
    if (memoryFallback) return memoryFallback;
    return defaultState();
  }
}

export function saveState(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    memoryFallback = clone(state);
  }
}

export function resetState() {
  const fresh = defaultState();
  saveState(fresh);
  return fresh;
}

let counter = 0;
export function newId(prefix) {
  counter += 1;
  return prefix + '-' + Date.now().toString(36) + '-' + counter;
}

// ---------- Format ----------

export function formatIDR(amount) {
  const value = Math.round(Number(amount) || 0);
  return 'Rp' + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export function formatDate(isoDate) {
  const parts = String(isoDate || '').split('-');
  if (parts.length !== 3) return String(isoDate || '');
  const day = parseInt(parts[2], 10);
  const month = MONTH_NAMES[parseInt(parts[1], 10) - 1] || '';
  return day + ' ' + month + ' ' + parts[0];
}

export function formatPercent(value) {
  return (Math.round(value * 10) / 10).toString().replace('.', ',') + '%';
}

export function escapeHtml(text) {
  return String(text == null ? '' : text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ---------- Turunan angka (dihitung dari state, selalu konsisten) ----------

export function totalIncome(state) {
  return state.income.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
}

export function totalExpense(state) {
  return state.expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
}

export function categorySpent(state, categoryId) {
  return state.expenses
    .filter((item) => item.categoryId === categoryId)
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
}

export function totalBudget(state) {
  return state.categories.reduce((sum, item) => sum + (Number(item.budget) || 0), 0);
}

export function categoryName(state, categoryId) {
  const found = state.categories.find((item) => item.id === categoryId);
  return found ? found.name : 'Tanpa kategori';
}

export function monthlyHistory(state) {
  // November dihitung dari state; lima bulan sebelumnya dari riwayat tetap.
  const rows = HISTORY.map((row) => ({ ...row }));
  rows.push({
    label: 'Nov 2026',
    income: totalIncome(state),
    expense: totalExpense(state)
  });
  return rows;
}

export function savingsRate(state) {
  const income = totalIncome(state);
  if (income <= 0) return 0;
  const saved = categorySpent(state, 'cat-tabungan');
  return (saved / income) * 100;
}

export function monthsToFinish(goal) {
  if (!goal || goal.saved >= goal.target) return 0;
  if (!goal.monthly || goal.monthly <= 0) return null;
  return Math.ceil((goal.target - goal.saved) / goal.monthly);
}

// ---------- CRUD: anggaran ----------

export function addCategory(state, name, budget) {
  const cleanName = String(name || '').trim();
  const amount = Math.max(0, Math.round(Number(budget) || 0));
  if (!cleanName) return null;
  const item = { id: newId('cat'), name: cleanName, budget: amount };
  state.categories.push(item);
  saveState(state);
  return item;
}

export function updateCategoryBudget(state, categoryId, budget) {
  const found = state.categories.find((item) => item.id === categoryId);
  if (!found) return false;
  found.budget = Math.max(0, Math.round(Number(budget) || 0));
  saveState(state);
  return true;
}

export function deleteCategory(state, categoryId) {
  const index = state.categories.findIndex((item) => item.id === categoryId);
  if (index === -1) return false;
  state.categories.splice(index, 1);
  state.expenses = state.expenses.filter((item) => item.categoryId !== categoryId);
  saveState(state);
  return true;
}

// ---------- CRUD: pengeluaran ----------

export function addExpense(state, expense) {
  const amount = Math.round(Number(expense.amount) || 0);
  if (amount <= 0) return null;
  const item = {
    id: newId('exp'),
    date: expense.date || '2026-11-26',
    categoryId: expense.categoryId,
    note: String(expense.note || '').trim() || 'Pengeluaran',
    amount
  };
  state.expenses.push(item);
  saveState(state);
  return item;
}

export function deleteExpense(state, expenseId) {
  const index = state.expenses.findIndex((item) => item.id === expenseId);
  if (index === -1) return false;
  state.expenses.splice(index, 1);
  saveState(state);
  return true;
}

// ---------- CRUD: pemasukan ----------

export function addIncome(state, source, amount) {
  const cleanSource = String(source || '').trim();
  const value = Math.round(Number(amount) || 0);
  if (!cleanSource || value <= 0) return null;
  const item = { id: newId('inc'), source: cleanSource, amount: value };
  state.income.push(item);
  saveState(state);
  return item;
}

export function deleteIncome(state, incomeId) {
  const index = state.income.findIndex((item) => item.id === incomeId);
  if (index === -1) return false;
  state.income.splice(index, 1);
  saveState(state);
  return true;
}

// ---------- CRUD: tujuan tabungan ----------

export function addGoal(state, name, target, monthly) {
  const cleanName = String(name || '').trim();
  const targetValue = Math.round(Number(target) || 0);
  if (!cleanName || targetValue <= 0) return null;
  const item = {
    id: newId('goal'),
    name: cleanName,
    target: targetValue,
    saved: 0,
    monthly: Math.max(0, Math.round(Number(monthly) || 0))
  };
  state.goals.push(item);
  saveState(state);
  return item;
}

export function addFunds(state, goalId, amount) {
  const found = state.goals.find((item) => item.id === goalId);
  const value = Math.round(Number(amount) || 0);
  if (!found || value <= 0) return false;
  found.saved = Math.min(found.target, found.saved + value);
  saveState(state);
  return true;
}

export function deleteGoal(state, goalId) {
  const index = state.goals.findIndex((item) => item.id === goalId);
  if (index === -1) return false;
  state.goals.splice(index, 1);
  saveState(state);
  return true;
}
