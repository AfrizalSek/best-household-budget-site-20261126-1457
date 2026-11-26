// main.js — Router hash + mount + event delegation untuk AnggaranKita.

import { loadState, saveState, resetState, formatIDR, formatPercent, addCategory, updateCategoryBudget, deleteCategory, addExpense, deleteExpense, addIncome, deleteIncome, addGoal, addFunds, deleteGoal } from './state.js';
import { VIEWS } from './views.js';
import { progressBar } from './charts.js';

const app = document.getElementById('app');
const state = loadState();

// Filter halaman Pelacak Pengeluaran (disimpan di memori sesi ini).
const expenseFilter = { categoryId: 'semua', query: '' };

const ROUTES = {
  '': 'home',
  '/': 'home',
  '/anggaran': 'budget',
  '/pengeluaran': 'expenses',
  '/tabungan': 'savings',
  '/kalkulator': 'calculator',
  '/laporan': 'report',
  '/panduan': 'guide'
};

function currentRoute() {
  const hash = window.location.hash.replace(/^#/, '');
  return ROUTES[hash] || 'home';
}

function setActiveNav(route) {
  document.querySelectorAll('.nav-link').forEach((link) => {
    link.classList.toggle('active', link.dataset.route === route);
  });
}

function render() {
  const route = currentRoute();
  const view = VIEWS[route] || VIEWS.home;
  if (route === 'expenses') {
    app.innerHTML = view(state, expenseFilter);
  } else {
    app.innerHTML = view(state);
  }
  setActiveNav(route);
  if (route === 'calculator') initCalculator();
  window.scrollTo(0, 0);
}

// ---------- Kalkulator (hitung ulang saat input berubah) ----------

function readNumber(id, fallback) {
  const el = document.getElementById(id);
  if (!el) return fallback;
  const value = Number(el.value);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

function update503020() {
  const income = readNumber('calc-income', 10300000);
  const set = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = formatIDR(value);
  };
  set('calc-need', income * 0.5);
  set('calc-want', income * 0.3);
  set('calc-save', income * 0.2);
}

function updateEmergency() {
  const expense = readNumber('calc-expense', 6274000);
  const months = readNumber('calc-months', 6);
  const have = readNumber('calc-have', 7250000);
  const target = expense * months;
  const gap = Math.max(target - have, 0);
  const pct = target > 0 ? (have / target) * 100 : 0;
  const set = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };
  set('calc-emergency-target', formatIDR(target));
  set('calc-emergency-gap', formatIDR(gap));
  set('calc-emergency-pct', formatPercent(pct));
  const bar = document.getElementById('calc-emergency-bar');
  if (bar) bar.innerHTML = progressBar(pct);
}

function updateInstallment() {
  const principal = readNumber('calc-principal', 10000000);
  const annualRate = readNumber('calc-rate', 12);
  const tenor = Math.max(1, Math.round(readNumber('calc-tenor', 12)));
  const monthlyRate = annualRate / 100 / 12;
  let payment;
  if (monthlyRate === 0) {
    payment = principal / tenor;
  } else {
    payment = (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -tenor));
  }
  const totalPay = payment * tenor;
  const totalInterest = totalPay - principal;
  const set = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };
  set('calc-installment', formatIDR(payment));
  set('calc-total-pay', formatIDR(totalPay));
  set('calc-total-interest', formatIDR(totalInterest));
}

function initCalculator() {
  update503020();
  updateEmergency();
  updateInstallment();
}

// ---------- Aksi (event delegation) ----------

function handleAction(action, target) {
  const id = target.dataset.id;
  if (action === 'delete-expense') {
    if (window.confirm('Hapus pengeluaran ini?')) deleteExpense(state, id);
  } else if (action === 'delete-category') {
    if (window.confirm('Hapus kategori ini beserta semua pengeluarannya?')) deleteCategory(state, id);
  } else if (action === 'delete-income') {
    if (window.confirm('Hapus sumber pemasukan ini?')) deleteIncome(state, id);
  } else if (action === 'delete-goal') {
    if (window.confirm('Hapus tujuan tabungan ini?')) deleteGoal(state, id);
  } else if (action === 'edit-budget') {
    const current = Number(target.dataset.budget) || 0;
    const answer = window.prompt('Anggaran baru (Rp):', String(current));
    if (answer === null) return;
    const value = Math.round(Number(answer.replace(/[^0-9]/g, '')) || 0);
    if (value >= 0) updateCategoryBudget(state, id, value);
  } else if (action === 'add-funds') {
    const answer = window.prompt('Jumlah dana yang disetor (Rp):', '100000');
    if (answer === null) return;
    const value = Math.round(Number(answer.replace(/[^0-9]/g, '')) || 0);
    if (value > 0) addFunds(state, id, value);
  } else {
    return;
  }
  render();
}

function handleForm(form) {
  const kind = form.dataset.form;
  const data = new FormData(form);
  const get = (name) => String(data.get(name) || '').trim();
  if (kind === 'add-category') {
    if (addCategory(state, get('name'), get('budget'))) form.reset();
  } else if (kind === 'add-expense') {
    if (addExpense(state, { date: get('date'), categoryId: get('categoryId'), note: get('note'), amount: get('amount') })) form.reset();
  } else if (kind === 'add-income') {
    if (addIncome(state, get('source'), get('amount'))) form.reset();
  } else if (kind === 'add-goal') {
    if (addGoal(state, get('name'), get('target'), get('monthly'))) form.reset();
  }
  render();
}

document.addEventListener('click', (event) => {
  const target = event.target.closest('[data-action]');
  if (!target) return;
  handleAction(target.dataset.action, target);
});

document.addEventListener('submit', (event) => {
  const form = event.target.closest('[data-form]');
  if (!form) return;
  event.preventDefault();
  handleForm(form);
});

document.addEventListener('input', (event) => {
  const el = event.target;
  if (el.id === 'filter-category') {
    expenseFilter.categoryId = el.value;
    render();
    const back = document.getElementById('filter-category');
    if (back) back.focus();
  } else if (el.id === 'filter-query') {
    expenseFilter.query = el.value;
    render();
    const back = document.getElementById('filter-query');
    if (back) {
      back.focus();
      back.setSelectionRange(back.value.length, back.value.length);
    }
  } else if (el.id && el.id.indexOf('calc-') === 0) {
    if (el.id === 'calc-income') update503020();
    if (el.id === 'calc-expense' || el.id === 'calc-months' || el.id === 'calc-have') updateEmergency();
    if (el.id === 'calc-principal' || el.id === 'calc-rate' || el.id === 'calc-tenor') updateInstallment();
  }
});

window.addEventListener('hashchange', render);

// Tombol reset data (di footer) — kembalikan data contoh awal.
const resetButton = document.getElementById('reset-data');
if (resetButton) {
  resetButton.addEventListener('click', () => {
    if (window.confirm('Kembalikan semua data ke contoh awal Keluarga Prasetyo?')) {
      const fresh = resetState();
      state.income = fresh.income;
      state.categories = fresh.categories;
      state.expenses = fresh.expenses;
      state.goals = fresh.goals;
      expenseFilter.categoryId = 'semua';
      expenseFilter.query = '';
      render();
    }
  });
}

render();
