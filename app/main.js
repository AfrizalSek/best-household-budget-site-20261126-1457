// main.js — Router hash + mount + event delegation AnggaranKita v2.

import {
  loadState, saveState, resetState, formatIDR, formatCompactIDR,
  addCategory, deleteCategory, addExpense, deleteExpense, addIncome,
  deleteIncome, addGoal, updateGoal, deleteGoal, setMonth, setBillPaid
} from './state.js';
import { VIEWS } from './views.js';

const app = document.getElementById('app');
const state = loadState();

// UI sementara halaman Arus Harian (tidak disimpan): skenario tabungan,
// potong belanja pasar, dan hari yang dipilih di kalender.
const ui = { scenario: false, cut: 0, selectedDay: null };

const ROUTES = {
  '': 'home',
  '/': 'home',
  '/arus-harian': 'daily',
  '/tagihan': 'bills',
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
  app.innerHTML = route === 'daily' ? view(state, ui) : view(state);
  setActiveNav(route);
  wireChartHover();
  window.scrollTo(0, 0);
}

// Hover crosshair + tooltip pada line chart saldo harian.
function wireChartHover() {
  document.querySelectorAll('.chart-wrap').forEach((wrap) => {
    const svg = wrap.querySelector('svg.daily-line');
    const tip = wrap.querySelector('.chart-tip');
    const cross = wrap.querySelector('.crosshair');
    if (!svg || !tip) return;
    svg.addEventListener('mousemove', (event) => {
      const target = event.target.closest('.dot');
      if (!target) { tip.hidden = true; if (cross) cross.setAttribute('opacity', '0'); return; }
      const day = target.getAttribute('data-day');
      const balance = Number(target.getAttribute('data-balance'));
      const income = Number(target.getAttribute('data-income'));
      const expense = Number(target.getAttribute('data-expense'));
      tip.innerHTML = '<strong>Hari ' + day + '</strong> · Saldo ' + formatIDR(balance)
        + (income > 0 ? '<br>Masuk ' + formatIDR(income) : '')
        + (expense > 0 ? '<br>Keluar ' + formatIDR(expense) : '');
      tip.hidden = false;
      const rect = wrap.getBoundingClientRect();
      tip.style.left = Math.min(Math.max(event.clientX - rect.left + 12, 8), rect.width - 180) + 'px';
      tip.style.top = Math.max(event.clientY - rect.top - 10, 8) + 'px';
      if (cross) {
        cross.setAttribute('x1', target.getAttribute('cx'));
        cross.setAttribute('x2', target.getAttribute('cx'));
        cross.setAttribute('opacity', '1');
      }
    });
    svg.addEventListener('mouseleave', () => {
      tip.hidden = true;
      if (cross) cross.setAttribute('opacity', '0');
    });
  });
}

function formValues(form) {
  return Object.fromEntries(new FormData(form).entries());
}
function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function runCalculator(form) {
  const kind = form.dataset.calc;
  const values = formValues(form);
  const result = form.parentElement.querySelector('[data-result]');
  if (!result) return;
  if (kind === 'fifty') {
    const income = num(values.income);
    result.innerHTML = '<p>Kebutuhan (50%): <strong>' + formatIDR(income * 0.5) + '</strong></p>'
      + '<p>Keinginan (30%): <strong>' + formatIDR(income * 0.3) + '</strong></p>'
      + '<p>Tabungan (20%): <strong>' + formatIDR(income * 0.2) + '</strong></p>';
  } else if (kind === 'emergency') {
    const target = num(values.expense) * 6;
    const remaining = target - num(values.saved);
    const months = num(values.monthly) > 0 ? Math.ceil(remaining / num(values.monthly)) : null;
    result.innerHTML = '<p>Target dana darurat (6 bulan pengeluaran): <strong>' + formatIDR(target) + '</strong></p>'
      + '<p>Kekurangan: <strong>' + formatIDR(Math.max(remaining, 0)) + '</strong></p>'
      + '<p>' + (remaining <= 0 ? 'Target sudah tercapai.' : months === null ? 'Isi setoran per bulan.' : 'Perkiraan tercapai dalam <strong>' + months + ' bulan</strong> dengan setoran ' + formatIDR(num(values.monthly)) + ' per bulan.') + '</p>';
  } else if (kind === 'loan') {
    const principal = Math.max(num(values.price) - num(values.down), 0);
    const monthlyRate = num(values.rate) / 100 / 12;
    const months = Math.max(num(values.months), 1);
    const payment = monthlyRate > 0
      ? (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months))
      : principal / months;
    const limit = num(values.income) * 0.3;
    result.innerHTML = '<p>Cicilan per bulan: <strong>' + formatIDR(payment) + '</strong></p>'
      + '<p>Total dibayar: <strong>' + formatIDR(payment * months) + '</strong> (pokok ' + formatIDR(principal) + ' + bunga ' + formatIDR(payment * months - principal) + ')</p>'
      + '<p>Batas aman (30% pemasukan): <strong>' + formatIDR(limit) + '</strong> — '
      + (payment <= limit ? 'cicilan ini masih aman.' : 'cicilan ini di atas batas aman, pertimbangkan DP lebih besar atau tenor lebih panjang.') + '</p>';
  }
}

document.addEventListener('submit', (event) => {
  const form = event.target;
  if (!form || !form.dataset) return;
  event.preventDefault();
  const values = formValues(form);
  if (form.dataset.form === 'add-income') {
    addIncome(state, { source: values.source.trim(), amount: num(values.amount) });
  } else if (form.dataset.form === 'add-expense') {
    addExpense(state, { date: values.date, note: values.note.trim(), categoryId: values.categoryId, amount: num(values.amount) });
  } else if (form.dataset.form === 'add-category') {
    addCategory(state, { name: values.name.trim(), budget: num(values.budget) });
  } else if (form.dataset.form === 'add-goal') {
    addGoal(state, { name: values.name.trim(), target: num(values.target), saved: num(values.saved), monthly: num(values.monthly) });
  } else if (form.dataset.form === 'edit-goal') {
    updateGoal(state, form.dataset.id, { name: values.name.trim(), target: num(values.target), saved: num(values.saved), monthly: num(values.monthly) });
  } else if (form.dataset.calc) {
    runCalculator(form);
    return;
  } else {
    return;
  }
  saveState(state);
  render();
});

document.addEventListener('click', (event) => {
  const el = event.target.closest('[data-action]');
  if (!el) return;
  const action = el.dataset.action;
  if (action === 'switch-month') {
    setMonth(state, el.dataset.month);
    ui.selectedDay = null;
    saveState(state);
    render();
  } else if (action === 'toggle-scenario') {
    ui.scenario = el.checked;
    render();
  } else if (action === 'select-day') {
    ui.selectedDay = Number(el.dataset.day);
    render();
  } else if (action === 'toggle-bill') {
    setBillPaid(state, el.dataset.id, !state.billsPaid[el.dataset.id]);
    saveState(state);
    render();
  } else if (action === 'delete-income') {
    deleteIncome(state, el.dataset.id);
    saveState(state);
    render();
  } else if (action === 'delete-expense') {
    deleteExpense(state, el.dataset.id);
    saveState(state);
    render();
  } else if (action === 'delete-category') {
    deleteCategory(state, el.dataset.id);
    saveState(state);
    render();
  } else if (action === 'delete-goal') {
    deleteGoal(state, el.dataset.id);
    saveState(state);
    render();
  } else if (action === 'reset-data') {
    resetState();
    Object.assign(state, loadState());
    ui.scenario = false;
    ui.cut = 0;
    ui.selectedDay = null;
    render();
  }
});

// Slider what-if: input langsung (bukan klik) supaya chart ikut bergerak.
document.addEventListener('input', (event) => {
  const el = event.target.closest('[data-action="set-cut"]');
  if (!el) return;
  ui.cut = Number(el.value);
  render();
  // Kembalikan fokus ke slider setelah render ulang.
  const again = document.querySelector('[data-action="set-cut"]');
  if (again) again.focus();
});

window.addEventListener('hashchange', render);
render();
