// state.js — State & logika AnggaranKita v2.
// Semua angka headline dihitung di sini dari data mentah — tidak ada
// total yang diketik lepas. buildDailyFlow adalah fungsi murni sehingga
// skenario "tabungan saat gajian" dan what-if pasar bisa dihitung ulang
// dengan data yang sama persis.

import { CATEGORIES, GOALS, NOV_EXPENSES, NOV_INCOME, NOV_INCOME_EVENTS, OCT_EXPENSES, OCT_INCOME, OCT_INCOME_EVENTS, MONTHS, BILLS } from './data.js';

export const STORAGE_KEY = 'anggarankita-v2';

function uid(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function buildDefaultState() {
  return {
    month: '2026-11',
    categories: JSON.parse(JSON.stringify(CATEGORIES)),
    goals: JSON.parse(JSON.stringify(GOALS)),
    months: {
      '2026-10': {
        income: JSON.parse(JSON.stringify(OCT_INCOME)),
        incomeEvents: JSON.parse(JSON.stringify(OCT_INCOME_EVENTS)),
        expenses: JSON.parse(JSON.stringify(OCT_EXPENSES))
      },
      '2026-11': {
        income: JSON.parse(JSON.stringify(NOV_INCOME)),
        incomeEvents: JSON.parse(JSON.stringify(NOV_INCOME_EVENTS)),
        expenses: JSON.parse(JSON.stringify(NOV_EXPENSES))
      }
    },
    billsPaid: Object.fromEntries(BILLS.map(b => [b.id, b.status === 'paid']))
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        parsed && Array.isArray(parsed.categories) && Array.isArray(parsed.goals) &&
        parsed.months && Array.isArray(parsed.months['2026-11']?.expenses) &&
        Array.isArray(parsed.months['2026-10']?.expenses) &&
        typeof parsed.billsPaid === 'object'
      ) {
        return parsed;
      }
    }
  } catch { /* rusak: kembali ke default */ }
  return buildDefaultState();
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState() {
  const fresh = buildDefaultState();
  saveState(fresh);
  return fresh;
}

// ---------- Format & util ----------
export function formatIDR(amount) {
  return 'Rp' + Math.round(amount).toLocaleString('id-ID');
}
export function formatCompactIDR(amount) {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '−' : '';
  if (abs >= 1000000) return `${sign}Rp${(abs / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`;
  if (abs >= 1000) return `${sign}Rp${Math.round(abs / 1000)} rb`;
  return `${sign}Rp${abs}`;
}
export function formatDateID(iso) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${months[m - 1]} ${y}`;
}
export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// ---------- Hitung dasar (per bulan) ----------
export function monthData(state, monthKey) {
  return state.months[monthKey || state.month];
}
export function totalIncomeFor(month) {
  return month.income.reduce((sum, item) => sum + item.amount, 0);
}
export function totalExpenseFor(month) {
  return month.expenses.reduce((sum, item) => sum + item.amount, 0);
}
export function remainingFor(month) {
  return totalIncomeFor(month) - totalExpenseFor(month);
}
export function categorySpentFor(month, categoryId) {
  return month.expenses
    .filter(item => item.categoryId === categoryId)
    .reduce((sum, item) => sum + item.amount, 0);
}
export function categoryTotalsFor(month) {
  return CATEGORIES.map(cat => ({
    ...cat,
    spent: categorySpentFor(month, cat.id)
  }));
}
export function savingsRateFor(month) {
  const tabungan = categorySpentFor(month, 'cat-tabungan');
  const income = totalIncomeFor(month);
  return income > 0 ? (tabungan / income) * 100 : 0;
}
export function dailyAverageFor(month, days) {
  return totalExpenseFor(month) / days;
}
export function monthsToFinish(goal) {
  if (goal.monthly <= 0) return null;
  const remaining = goal.target - goal.saved;
  if (remaining <= 0) return 0;
  return Math.ceil(remaining / goal.monthly);
}
export function monthlyHistory(state) {
  const base = [
    { label: 'Jun 2026', income: 10100000, expense: 6850000 },
    { label: 'Jul 2026', income: 10300000, expense: 7120000 },
    { label: 'Agu 2026', income: 10150000, expense: 6480000 },
    { label: 'Sep 2026', income: 10300000, expense: 7300000 }
  ];
  for (const key of ['2026-10', '2026-11']) {
    const m = state.months[key];
    base.push({
      label: MONTHS[key].short, income: totalIncomeFor(m), expense: totalExpenseFor(m)
    });
  }
  return base;
}
export function biggestCategory(month) {
  let best = null;
  for (const cat of CATEGORIES) {
    const spent = categorySpentFor(month, cat.id);
    if (!best || spent > best.spent) best = { ...cat, spent };
  }
  return best;
}
export function compareMonths(state) {
  const oct = state.months['2026-10'];
  const nov = state.months['2026-11'];
  const rows = CATEGORIES.map(cat => {
    const octSpent = categorySpentFor(oct, cat.id);
    const novSpent = categorySpentFor(nov, cat.id);
    return { ...cat, octSpent, novSpent, delta: novSpent - octSpent };
  });
  return {
    rows,
    octIncome: totalIncomeFor(oct),
    novIncome: totalIncomeFor(nov),
    octExpense: totalExpenseFor(oct),
    novExpense: totalExpenseFor(nov),
    octRemaining: remainingFor(oct),
    novRemaining: remainingFor(nov),
    octFlow: buildDailyFlow('2026-10', oct.expenses, oct.incomeEvents, MONTHS['2026-10'].openingBalance),
    novFlow: buildDailyFlow('2026-11', nov.expenses, nov.incomeEvents, MONTHS['2026-11'].openingBalance)
  };
}

// ---------- Arus harian (fungsi murni) ----------
// Membangun saldo akhir setiap hari dari saldo awal + pemasukan − pengeluaran.
export function buildDailyFlow(monthKey, expenses, incomeEvents, openingBalance) {
  const meta = MONTHS[monthKey];
  const days = [];
  let balance = openingBalance;
  let lowest = balance;
  let lowestDay = 0;
  let minusDays = 0;
  for (let day = 1; day <= meta.days; day++) {
    const date = `${monthKey}-${String(day).padStart(2, '0')}`;
    const dayExpenses = expenses.filter(e => e.date === date);
    const dayIncome = incomeEvents.filter(ev => ev.day === day);
    const expense = dayExpenses.reduce((s, e) => s + e.amount, 0);
    const income = dayIncome.reduce((s, ev) => s + ev.amount, 0);
    balance += income - expense;
    if (balance < lowest) { lowest = balance; lowestDay = day; }
    if (balance < 0) minusDays++;
    days.push({ day, date, income, expense, balance, incomeEvents: dayIncome, expenses: dayExpenses });
  }
  const buffer = lowest < 0 ? Math.ceil(-lowest / 100000) * 100000 : 0;
  return { days, lowest, lowestDay, minusDays, endBalance: balance, buffer, openingBalance };
}

// Skenario: setor tabungan (dana darurat + renovasi dapur) digeser ke tanggal
// gajian (25). Total bulan tidak berubah — hanya arusnya yang berubah.
export function applySavingsOnPayday(expenses, paydayDay = 25) {
  const moved = expenses.filter(e => e.savingsTransfer);
  const rest = expenses.filter(e => !e.savingsTransfer);
  const movedOnPayday = moved.map(e => ({
    ...e,
    id: `${e.id}-p25`,
    date: e.date.slice(0, 8) + String(paydayDay).padStart(2, '0'),
    note: `${e.note} — dipindah ke tanggal gajian`
  }));
  return [...rest, ...movedOnPayday];
}

// What-if: kurangi belanja pasar RpX/bulan, disebar proporsional ke seluruh
// belanja pasar (item dengan flag market). X tidak boleh melebihi total pasar.
export function applyMarketCut(expenses, cut) {
  if (!cut || cut <= 0) return expenses.map(e => ({ ...e }));
  const market = expenses.filter(e => e.market);
  const totalMarket = market.reduce((s, e) => s + e.amount, 0);
  if (totalMarket <= 0 || cut >= totalMarket) return expenses.map(e => ({ ...e }));
  const ratio = (totalMarket - cut) / totalMarket;
  let assigned = 0;
  const reduced = market.map((e, i) => {
    const next = i === market.length - 1
      ? e.amount - (cut - assigned)
      : Math.round(e.amount * ratio);
    assigned += e.amount - next;
    return { ...e, amount: next };
  });
  const byId = new Map(reduced.map(e => [e.id, e]));
  return expenses.map(e => byId.get(e.id) || { ...e });
}
export function marketTotal(expenses) {
  return expenses.filter(e => e.market).reduce((s, e) => s + e.amount, 0);
}

// ---------- Tagihan ----------
export function billsForMonth(monthKey) {
  return BILLS.filter(b => b.monthKey === monthKey);
}
export function billsSummary(state, monthKey) {
  const bills = billsForMonth(monthKey);
  const paid = bills.filter(b => state.billsPaid[b.id]);
  const unpaid = bills.filter(b => !state.billsPaid[b.id]);
  const total = bills.reduce((s, b) => s + b.amount, 0);
  const paidTotal = paid.reduce((s, b) => s + b.amount, 0);
  const unpaidTotal = unpaid.reduce((s, b) => s + b.amount, 0);
  const upcoming = BILLS.filter(b => b.status === 'upcoming');
  return { bills, paid, unpaid, total, paidTotal, unpaidTotal, upcoming };
}

// ---------- CRUD (berlaku untuk bulan aktif) ----------
export function addIncome(state, income) {
  const month = monthData(state);
  month.income.push({ id: uid('inc'), ...income });
}
export function updateIncome(state, id, changes) {
  const month = monthData(state);
  const item = month.income.find(i => i.id === id);
  if (item) Object.assign(item, changes);
}
export function deleteIncome(state, id) {
  const month = monthData(state);
  month.income = month.income.filter(i => i.id !== id);
}
export function addExpense(state, expense) {
  const month = monthData(state);
  month.expenses.push({ id: uid('exp'), ...expense });
}
export function updateExpense(state, id, changes) {
  const month = monthData(state);
  const item = month.expenses.find(e => e.id === id);
  if (item) Object.assign(item, changes);
}
export function deleteExpense(state, id) {
  const month = monthData(state);
  month.expenses = month.expenses.filter(e => e.id !== id);
}
export function addCategory(state, category) {
  state.categories.push({ id: uid('cat'), ...category });
}
export function updateCategory(state, id, changes) {
  const item = state.categories.find(c => c.id === id);
  if (item) Object.assign(item, changes);
}
export function deleteCategory(state, id) {
  state.categories = state.categories.filter(c => c.id !== id);
  const month = monthData(state);
  month.expenses = month.expenses.filter(e => e.categoryId !== id);
}
export function addGoal(state, goal) {
  state.goals.push({ id: uid('goal'), ...goal });
}
export function updateGoal(state, id, changes) {
  const item = state.goals.find(g => g.id === id);
  if (item) Object.assign(item, changes);
}
export function deleteGoal(state, id) {
  state.goals = state.goals.filter(g => g.id !== id);
}
export function setMonth(state, monthKey) {
  state.month = monthKey;
}
export function setBillPaid(state, billId, paid) {
  state.billsPaid[billId] = paid;
}
