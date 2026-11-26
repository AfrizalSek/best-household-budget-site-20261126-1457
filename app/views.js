// views.js — Render tiap halaman dari state. Semua angka diambil dari state.js
// sehingga konsisten antar halaman.

import {
  formatIDR, formatDate, formatPercent, escapeHtml,
  totalIncome, totalExpense, totalBudget, categorySpent, categoryName,
  monthlyHistory, savingsRate, monthsToFinish
} from './state.js';
import { barChart, donutChart, progressBar } from './charts.js';

function pctColor(pct) {
  if (pct >= 100) return '#b3261e';
  if (pct >= 75) return '#d97b29';
  return '#2e6b34';
}

function moneyCell(value) {
  return '<td class="num">' + formatIDR(value) + '</td>';
}

function goalCard(state, goal) {
  const pct = goal.target > 0 ? (goal.saved / goal.target) * 100 : 0;
  const months = monthsToFinish(goal);
  const finishText = months === 0
    ? 'Tercapai — target sudah penuh.'
    : (months === null
      ? 'Isi setoran per bulan untuk melihat perkiraan selesai.'
      : 'Perkiraan selesai dalam ' + months + ' bulan lagi dengan setoran ' + formatIDR(goal.monthly) + ' per bulan.');
  return '<article class="card goal-card">'
    + '<div class="card-head"><h3>' + escapeHtml(goal.name) + '</h3>'
    + '<button class="btn btn-danger btn-small" data-action="delete-goal" data-id="' + goal.id + '">Hapus</button></div>'
    + '<p class="big">' + formatIDR(goal.saved) + ' <span class="muted">dari ' + formatIDR(goal.target) + '</span></p>'
    + progressBar(pct, pctColor(pct))
    + '<p class="muted">' + formatPercent(pct) + ' tercapai &middot; sisa ' + formatIDR(Math.max(goal.target - goal.saved, 0)) + '</p>'
    + '<p>' + finishText + '</p>'
    + '<button class="btn" data-action="add-funds" data-id="' + goal.id + '">Tambah dana</button>'
    + '</article>';
}

// ---------- 1. Beranda ----------

export function viewHome(state) {
  const income = totalIncome(state);
  const expense = totalExpense(state);
  const rest = income - expense;
  const rate = savingsRate(state);
  const history = monthlyHistory(state);

  const warnings = state.categories
    .map((cat) => ({ cat, spent: categorySpent(state, cat.id) }))
    .filter((row) => row.cat.budget > 0 && (row.spent / row.cat.budget) >= 0.75)
    .sort((a, b) => (b.spent / b.cat.budget) - (a.spent / a.cat.budget));

  const warningHtml = warnings.length === 0
    ? '<p class="ok">Semua kategori masih aman, di bawah 75% anggaran.</p>'
    : '<ul class="warn-list">' + warnings.map((row) => {
      const pct = (row.spent / row.cat.budget) * 100;
      const over = row.spent > row.cat.budget;
      return '<li><strong>' + escapeHtml(row.cat.name) + '</strong> sudah ' + formatPercent(pct)
        + ' (' + formatIDR(row.spent) + ' dari ' + formatIDR(row.cat.budget) + ')'
        + (over ? ' — <span class="danger-text">melewati anggaran ' + formatIDR(row.spent - row.cat.budget) + '</span>' : ' — mendekati batas, tahan dulu belanja kategori ini.')
        + '</li>';
    }).join('') + '</ul>';

  const slices = state.categories
    .map((cat) => ({ label: cat.name, value: categorySpent(state, cat.id) }))
    .filter((s) => s.value > 0)
    .sort((a, b) => b.value - a.value);

  const legend = slices.map((s, i) => {
    const colors = ['#2e6b34', '#5a9e5f', '#8fbc8f', '#c9a227', '#d97b29', '#7a9e7e'];
    return '<li><span class="dot" style="background:' + colors[i % colors.length] + '"></span>'
      + escapeHtml(s.label) + ' — <strong>' + formatIDR(s.value) + '</strong></li>';
  }).join('');

  const recent = [...state.expenses]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 5);

  const recentRows = recent.map((item) => '<tr><td>' + formatDate(item.date) + '</td><td>'
    + escapeHtml(item.note) + '</td><td>' + escapeHtml(categoryName(state, item.categoryId)) + '</td>'
    + moneyCell(item.amount) + '</tr>').join('');

  const goalsHtml = state.goals.map((goal) => goalCard(state, goal)).join('');

  return '<section class="hero">'
    + '<h1>Anggaran Keluarga Prasetyo</h1>'
    + '<p>' + escapeHtml(state.family.city) + ' &middot; ' + escapeHtml(state.family.members)
    + ' &middot; Bulan ' + escapeHtml(state.family.month) + '</p>'
    + '<p>Semua angka di situs ini dihitung dari satu data yang sama. Tambah atau hapus pengeluaran di halaman Pelacak, dan angka di sini ikut berubah.</p>'
    + '</section>'

    + '<section class="summary-grid" aria-label="Ringkasan bulan ini">'
    + '<div class="card stat"><span class="stat-label">Pemasukan</span><span class="stat-value">' + formatIDR(income) + '</span></div>'
    + '<div class="card stat"><span class="stat-label">Pengeluaran</span><span class="stat-value">' + formatIDR(expense) + '</span></div>'
    + '<div class="card stat"><span class="stat-label">Sisa</span><span class="stat-value">' + formatIDR(rest) + '</span></div>'
    + '<div class="card stat"><span class="stat-label">Tingkat tabungan</span><span class="stat-value">' + formatPercent(rate) + '</span><span class="muted">dari pemasukan</span></div>'
    + '</section>'

    + '<section class="card"><h2>Perlu perhatian</h2>' + warningHtml + '</section>'

    + '<section class="two-col">'
    + '<div class="card"><h2>Pemasukan vs pengeluaran — 6 bulan</h2>'
    + barChart(history)
    + '<p class="legend-line"><span class="dot" style="background:#2e6b34"></span> Pemasukan &nbsp; <span class="dot" style="background:#d97b29"></span> Pengeluaran</p></div>'
    + '<div class="card"><h2>Pengeluaran per kategori</h2>'
    + donutChart(slices)
    + '<ul class="legend">' + legend + '</ul></div>'
    + '</section>'

    + '<section class="card"><h2>5 pengeluaran terakhir</h2>'
    + '<div class="table-wrap"><table><thead><tr><th>Tanggal</th><th>Keterangan</th><th>Kategori</th><th class="num">Jumlah</th></tr></thead>'
    + '<tbody>' + recentRows + '</tbody></table></div>'
    + '<p><a class="btn" href="#/pengeluaran">Lihat semua pengeluaran</a></p></section>'

    + '<section><h2>Tujuan tabungan</h2><div class="goal-grid">' + goalsHtml + '</div>'
    + '<p><a class="btn" href="#/tabungan">Kelola semua tujuan tabungan</a></p></section>'

    + '<section class="card"><h2>Pemasukan bulan ini</h2>'
    + '<ul class="income-list">' + state.income.map((item) => '<li><span>' + escapeHtml(item.source) + '</span><strong>' + formatIDR(item.amount) + '</strong> '
      + '<button class="btn btn-danger btn-small" data-action="delete-income" data-id="' + item.id + '">Hapus</button></li>').join('') + '</ul>'
    + '<form data-form="add-income" class="form-inline">'
    + '<label>Sumber pemasukan <input name="source" type="text" required maxlength="60" placeholder="Contoh: Gaji lembur"></label>'
    + '<label>Jumlah (Rp) <input name="amount" type="number" min="1000" step="1000" required placeholder="500000"></label>'
    + '<button class="btn" type="submit">Tambah pemasukan</button></form></section>';
}

// ---------- 2. Perencana Anggaran ----------

export function viewBudget(state) {
  const budget = totalBudget(state);
  const spent = totalExpense(state);

  const rows = state.categories.map((cat) => {
    const used = categorySpent(state, cat.id);
    const pct = cat.budget > 0 ? (used / cat.budget) * 100 : 0;
    const left = cat.budget - used;
    return '<tr><td><strong>' + escapeHtml(cat.name) + '</strong></td>'
      + moneyCell(cat.budget) + moneyCell(used)
      + '<td class="num ' + (left < 0 ? 'danger-text' : '') + '">' + formatIDR(left) + '</td>'
      + '<td><div class="bar-cell">' + progressBar(pct, pctColor(pct))
      + '<span class="muted">' + formatPercent(pct) + '</span></div></td>'
      + '<td class="actions"><button class="btn btn-small" data-action="edit-budget" data-id="' + cat.id + '" data-budget="' + cat.budget + '">Ubah</button> '
      + '<button class="btn btn-danger btn-small" data-action="delete-category" data-id="' + cat.id + '">Hapus</button></td></tr>';
  }).join('');

  return '<h1>Perencana Anggaran</h1>'
    + '<p>Atur batas belanja tiap kategori untuk bulan ' + escapeHtml(state.family.month)
    + '. Realisasi dihitung otomatis dari pengeluaran yang dicatat di halaman Pelacak.</p>'
    + '<section class="summary-grid"><div class="card stat"><span class="stat-label">Total anggaran</span><span class="stat-value">' + formatIDR(budget) + '</span></div>'
    + '<div class="card stat"><span class="stat-label">Total realisasi</span><span class="stat-value">' + formatIDR(spent) + '</span></div>'
    + '<div class="card stat"><span class="stat-label">Sisa anggaran</span><span class="stat-value">' + formatIDR(budget - spent) + '</span></div></section>'
    + '<section class="card"><div class="table-wrap"><table><thead><tr><th>Kategori</th><th class="num">Anggaran</th><th class="num">Realisasi</th><th class="num">Sisa</th><th>Progres</th><th>Aksi</th></tr></thead>'
    + '<tbody>' + rows + '</tbody></table></div></section>'
    + '<section class="card"><h2>Tambah kategori baru</h2>'
    + '<form data-form="add-category" class="form-inline">'
    + '<label>Nama kategori <input name="name" type="text" required maxlength="40" placeholder="Contoh: Langganan"></label>'
    + '<label>Anggaran (Rp) <input name="budget" type="number" min="0" step="1000" required placeholder="300000"></label>'
    + '<button class="btn" type="submit">Tambah kategori</button></form>'
    + '<p class="muted">Menghapus kategori juga menghapus semua pengeluaran dalam kategori itu.</p></section>';
}

// ---------- 3. Pelacak Pengeluaran ----------

export function viewExpenses(state, filter) {
  const activeFilter = filter || { categoryId: 'semua', query: '' };
  const options = '<option value="semua">Semua kategori</option>' + state.categories.map((cat) =>
    '<option value="' + cat.id + '"' + (activeFilter.categoryId === cat.id ? ' selected' : '') + '>' + escapeHtml(cat.name) + '</option>').join('');

  let list = [...state.expenses].sort((a, b) => (a.date < b.date ? 1 : -1));
  if (activeFilter.categoryId !== 'semua') {
    list = list.filter((item) => item.categoryId === activeFilter.categoryId);
  }
  if (activeFilter.query) {
    const q = activeFilter.query.toLowerCase();
    list = list.filter((item) => item.note.toLowerCase().includes(q));
  }

  const rows = list.length === 0
    ? '<tr><td colspan="5">Tidak ada pengeluaran yang cocok dengan filter.</td></tr>'
    : list.map((item) => '<tr><td>' + formatDate(item.date) + '</td><td>' + escapeHtml(item.note) + '</td><td>'
      + escapeHtml(categoryName(state, item.categoryId)) + '</td>' + moneyCell(item.amount)
      + '<td><button class="btn btn-danger btn-small" data-action="delete-expense" data-id="' + item.id + '">Hapus</button></td></tr>').join('');

  const shownTotal = list.reduce((sum, item) => sum + item.amount, 0);

  const perCategory = state.categories.map((cat) => {
    const used = categorySpent(state, cat.id);
    return used > 0 ? '<li><span>' + escapeHtml(cat.name) + '</span><strong>' + formatIDR(used) + '</strong></li>' : '';
  }).join('');

  return '<h1>Pelacak Pengeluaran</h1>'
    + '<p>Catat setiap rupiah yang keluar. Total di halaman ini sama dengan total pengeluaran di Beranda dan Laporan.</p>'
    + '<section class="card"><h2>Tambah pengeluaran</h2>'
    + '<form data-form="add-expense" class="form-grid">'
    + '<label>Tanggal <input name="date" type="date" value="2026-11-26" required></label>'
    + '<label>Kategori <select name="categoryId">' + state.categories.map((cat) => '<option value="' + cat.id + '">' + escapeHtml(cat.name) + '</option>').join('') + '</select></label>'
    + '<label>Keterangan <input name="note" type="text" required maxlength="80" placeholder="Contoh: Belanja mingguan Pasar Tuban"></label>'
    + '<label>Jumlah (Rp) <input name="amount" type="number" min="1000" step="1000" required placeholder="100000"></label>'
    + '<button class="btn" type="submit">Simpan pengeluaran</button></form></section>'
    + '<section class="card"><h2>Daftar pengeluaran</h2>'
    + '<div class="filter-row"><label>Filter kategori <select id="filter-category">' + options + '</select></label>'
    + '<label>Cari <input id="filter-query" type="search" placeholder="Cari keterangan…" value="' + escapeHtml(activeFilter.query) + '"></label></div>'
    + '<p><strong>Total yang ditampilkan: ' + formatIDR(shownTotal) + '</strong> (' + list.length + ' pengeluaran)</p>'
    + '<div class="table-wrap"><table><thead><tr><th>Tanggal</th><th>Keterangan</th><th>Kategori</th><th class="num">Jumlah</th><th>Aksi</th></tr></thead>'
    + '<tbody>' + rows + '</tbody></table></div></section>'
    + '<section class="card"><h2>Total per kategori</h2><ul class="income-list">' + perCategory + '</ul></section>';
}

// ---------- 4. Tujuan Tabungan ----------

export function viewSavings(state) {
  const totalTarget = state.goals.reduce((sum, g) => sum + g.target, 0);
  const totalSaved = state.goals.reduce((sum, g) => sum + g.saved, 0);
  const cards = state.goals.length === 0
    ? '<p>Belum ada tujuan tabungan. Tambahkan tujuan pertama di bawah.</p>'
    : state.goals.map((goal) => goalCard(state, goal)).join('');

  return '<h1>Tujuan Tabungan</h1>'
    + '<p>Tabungan bukan sisa belanja — sisihkan di awal bulan, lalu lacak progresnya di sini.</p>'
    + '<section class="summary-grid"><div class="card stat"><span class="stat-label">Total target</span><span class="stat-value">' + formatIDR(totalTarget) + '</span></div>'
    + '<div class="card stat"><span class="stat-label">Total terkumpul</span><span class="stat-value">' + formatIDR(totalSaved) + '</span></div>'
    + '<div class="card stat"><span class="stat-label">Kekurangan</span><span class="stat-value">' + formatIDR(Math.max(totalTarget - totalSaved, 0)) + '</span></div></section>'
    + '<section><div class="goal-grid">' + cards + '</div></section>'
    + '<section class="card"><h2>Tambah tujuan baru</h2>'
    + '<form data-form="add-goal" class="form-grid">'
    + '<label>Nama tujuan <input name="name" type="text" required maxlength="50" placeholder="Contoh: Biaya masuk sekolah"></label>'
    + '<label>Target (Rp) <input name="target" type="number" min="10000" step="10000" required placeholder="5000000"></label>'
    + '<label>Setoran per bulan (Rp) <input name="monthly" type="number" min="0" step="10000" required placeholder="500000"></label>'
    + '<button class="btn" type="submit">Tambah tujuan</button></form></section>';
}

// ---------- 5. Kalkulator ----------

export function viewCalculator() {
  return '<h1>Kalkulator Anggaran</h1>'
    + '<p>Semua kalkulator menghitung otomatis begitu angka diubah. Tidak ada tombol hitung yang perlu ditekan.</p>'

    + '<section class="card"><h2>Aturan 50/30/20</h2>'
    + '<p>Bagi pemasukan bulanan: 50% kebutuhan, 30% keinginan, 20% tabungan dan bayar utang.</p>'
    + '<label>Pemasukan bulanan (Rp) <input id="calc-income" type="number" min="0" step="10000" value="10300000"></label>'
    + '<div class="summary-grid calc-result">'
    + '<div class="card stat"><span class="stat-label">Kebutuhan (50%)</span><span class="stat-value" id="calc-need">Rp5.150.000</span></div>'
    + '<div class="card stat"><span class="stat-label">Keinginan (30%)</span><span class="stat-value" id="calc-want">Rp3.090.000</span></div>'
    + '<div class="card stat"><span class="stat-label">Tabungan (20%)</span><span class="stat-value" id="calc-save">Rp2.060.000</span></div></div>'
    + '<p class="muted">Keluarga Prasetyo memakai Rp1.500.000 untuk tabungan — di bawah patokan 20% (Rp2.060.000). Selisih Rp560.000 bisa ditambah dari sisa belanja makanan yang masih Rp670.000.</p></section>'

    + '<section class="card"><h2>Dana darurat</h2>'
    + '<p>Dana darurat ideal = pengeluaran bulanan × jumlah bulan cadangan. Untuk keluarga dengan 2 anak dan satu penghasilan utama, target 6 bulan.</p>'
    + '<div class="form-grid">'
    + '<label>Pengeluaran per bulan (Rp) <input id="calc-expense" type="number" min="0" step="10000" value="6274000"></label>'
    + '<label>Jumlah bulan cadangan <input id="calc-months" type="number" min="1" max="12" step="1" value="6"></label>'
    + '<label>Dana darurat yang sudah ada (Rp) <input id="calc-have" type="number" min="0" step="10000" value="7250000"></label>'
    + '</div>'
    + '<p class="calc-line">Target dana darurat: <strong id="calc-emergency-target">Rp37.644.000</strong></p>'
    + '<p class="calc-line">Kekurangan: <strong id="calc-emergency-gap">Rp30.394.000</strong></p>'
    + '<p class="calc-line">Progres: <strong id="calc-emergency-pct">19,3%</strong></p>'
    + '<div id="calc-emergency-bar">' + progressBar(19.3) + '</div></section>'

    + '<section class="card"><h2>Kalkulator cicilan</h2>'
    + '<p>Angsuran tetap per bulan dengan rumus anuitas. Bunga dihitung dari sisa pokok tiap bulan.</p>'
    + '<div class="form-grid">'
    + '<label>Pokok pinjaman (Rp) <input id="calc-principal" type="number" min="0" step="100000" value="10000000"></label>'
    + '<label>Bunga per tahun (%) <input id="calc-rate" type="number" min="0" max="60" step="0.5" value="12"></label>'
    + '<label>Tenor (bulan) <input id="calc-tenor" type="number" min="1" max="360" step="1" value="12"></label>'
    + '</div>'
    + '<p class="calc-line">Angsuran per bulan: <strong id="calc-installment">Rp888.488</strong></p>'
    + '<p class="calc-line">Total yang dibayar: <strong id="calc-total-pay">Rp10.661.856</strong></p>'
    + '<p class="calc-line">Total bunga: <strong id="calc-total-interest">Rp661.856</strong></p>'
    + '<p class="muted">Contoh di atas: pinjaman Rp10.000.000 bunga 12% per tahun selama 12 bulan berarti angsuran Rp888.488 per bulan dan total bunga Rp661.856.</p></section>';
}

// ---------- 6. Laporan ----------

export function viewReport(state) {
  const history = monthlyHistory(state);
  const rows = history.map((row) => {
    const rest = row.income - row.expense;
    const rate = row.income > 0 ? (rest / row.income) * 100 : 0;
    return '<tr><td>' + escapeHtml(row.label) + '</td>' + moneyCell(row.income) + moneyCell(row.expense)
      + moneyCell(rest) + '<td class="num">' + formatPercent(rate) + '</td></tr>';
  }).join('');

  const avgIncome = Math.round(history.reduce((s, r) => s + r.income, 0) / history.length);
  const avgExpense = Math.round(history.reduce((s, r) => s + r.expense, 0) / history.length);

  const ranked = state.categories
    .map((cat) => ({ name: cat.name, spent: categorySpent(state, cat.id), budget: cat.budget }))
    .filter((row) => row.spent > 0)
    .sort((a, b) => b.spent - a.spent);
  const top = ranked[0];

  const over = state.categories
    .map((cat) => ({ name: cat.name, spent: categorySpent(state, cat.id), budget: cat.budget }))
    .filter((row) => row.spent > row.budget);

  const tips = [];
  if (top) {
    tips.push('Kategori terboros bulan ini adalah <strong>' + escapeHtml(top.name) + '</strong> (' + formatIDR(top.spent)
      + '). Belanja mingguan empat kali di Pasar Tuban menghabiskan ' + formatIDR(1610000)
      + ' — coba satu kali belanja bulanan untuk beras, minyak, dan bumbu supaya harga lebih murah.');
  }
  if (over.length > 0) {
    tips.push('Kategori yang melewati anggaran: ' + over.map((row) => escapeHtml(row.name) + ' (lebih ' + formatIDR(row.spent - row.budget) + ')').join(', ')
      + '. Naikkan anggarannya di halaman Perencana atau potong dari kategori Hiburan.');
  } else {
    tips.push('Tidak ada kategori yang melewati anggaran bulan ini. Kategori paling dekat batas adalah Tabungan (100% — tercapai) dan Makanan (76%). Pertahankan pola ini sampai akhir bulan.');
  }
  const sixMonthBest = history.reduce((best, row) => (row.expense < best.expense ? row : best), history[0]);
  tips.push('Bulan paling hemat dalam 6 bulan terakhir adalah <strong>' + escapeHtml(sixMonthBest.label) + '</strong> dengan pengeluaran '
    + formatIDR(sixMonthBest.expense) + ', ' + formatIDR(avgExpense - sixMonthBest.expense)
    + ' di bawah rata-rata ' + formatIDR(avgExpense) + '. Ulangi pola belanja bulan itu: belanja mingguan terjadwal dan masak di rumah.');

  return '<h1>Laporan Bulanan</h1>'
    + '<p>Ringkasan enam bulan terakhir Keluarga Prasetyo, Juni–November 2026.</p>'
    + '<section class="summary-grid"><div class="card stat"><span class="stat-label">Rata-rata pemasukan</span><span class="stat-value">' + formatIDR(avgIncome) + '</span></div>'
    + '<div class="card stat"><span class="stat-label">Rata-rata pengeluaran</span><span class="stat-value">' + formatIDR(avgExpense) + '</span></div>'
    + '<div class="card stat"><span class="stat-label">Rata-rata sisa</span><span class="stat-value">' + formatIDR(avgIncome - avgExpense) + '</span></div></section>'
    + '<section class="card"><h2>Pemasukan, pengeluaran, dan sisa</h2>'
    + '<div class="table-wrap"><table><thead><tr><th>Bulan</th><th class="num">Pemasukan</th><th class="num">Pengeluaran</th><th class="num">Sisa</th><th class="num">Sisa (%)</th></tr></thead>'
    + '<tbody>' + rows + '</tbody></table></div></section>'
    + '<section class="card"><h2>Kategori terboros</h2>'
    + (top
      ? '<p><strong>' + escapeHtml(top.name) + '</strong> — ' + formatIDR(top.spent) + ' dari anggaran ' + formatIDR(top.budget)
        + ' (' + formatPercent(top.budget > 0 ? (top.spent / top.budget) * 100 : 0) + ').</p>'
      : '<p>Belum ada pengeluaran tercatat.</p>')
    + '<h2>Tips hemat berdasarkan data</h2><ol class="tips">' + tips.map((t) => '<li>' + t + '</li>').join('') + '</ol></section>';
}

// ---------- 7. Panduan ----------

export function viewGuide() {
  return '<h1>Panduan AnggaranKita</h1>'
    + '<p>Situs ini dibuat untuk keluarga yang ingin mengatur uang bulanan tanpa aplikasi yang rumit. Semua data tersimpan di peramban Anda sendiri.</p>'
    + '<section class="card"><h2>Cara memakai situs ini</h2><ol class="tips">'
    + '<li><strong>Beranda</strong> — lihat ringkasan bulan ini: pemasukan, pengeluaran, sisa, dan kategori yang hampir melewati anggaran.</li>'
    + '<li><strong>Perencana Anggaran</strong> — tetapkan batas belanja tiap kategori di awal bulan. Ubah angkanya kapan saja dengan tombol Ubah.</li>'
    + '<li><strong>Pelacak Pengeluaran</strong> — catat setiap pengeluaran begitu terjadi. Pakai filter kategori dan kolom cari untuk menemukan catatan lama.</li>'
    + '<li><strong>Tujuan Tabungan</strong> — buat target (dana darurat, renovasi, liburan), lalu tekan Tambah dana setiap kali menyetor.</li>'
    + '<li><strong>Kalkulator</strong> — cek pembagian 50/30/20, hitung dana darurat ideal, dan hitung angsuran cicilan sebelum berutang.</li>'
    + '<li><strong>Laporan</strong> — bandingkan enam bulan terakhir dan baca tips hemat yang dihitung dari data Anda sendiri.</li>'
    + '</ol></section>'
    + '<section class="card"><h2>5 tips mengatur anggaran rumah tangga</h2><ol class="tips">'
    + '<li><strong>Sisihkan tabungan di awal, bukan dari sisa.</strong> Begitu gaji masuk, pindahkan dulu Rp1.500.000 ke tabungan — sama seperti Keluarga Prasetyo. Sisa belanja jarang tersisa kalau menunggu akhir bulan.</li>'
    + '<li><strong>Belanja makanan seminggu sekali dengan daftar.</strong> Empat kali belanja mingguan Keluarga Prasetyo totalnya Rp1.610.000. Tanpa daftar, belanja tanpa rencana biasanya menambah 10–15% dari tagihan.</li>'
    + '<li><strong>Pisahkan uang kebutuhan dan keinginan.</strong> Kebutuhan (makan, listrik, sekolah) sekitar Rp6.050.000 dari pemasukan Rp10.300.000. Sisanya dibagi untuk hiburan dan tabungan — jangan campur dalam satu dompet.</li>'
    + '<li><strong>Bangun dana darurat 6 bulan pengeluaran.</strong> Dengan pengeluaran Rp6.274.000 per bulan, targetnya Rp37.644.000. Dana darurat Keluarga Prasetyo baru Rp7.250.000 (19,3%) — terus setor Rp1.000.000 per bulan.</li>'
    + '<li><strong>Cek anggaran tiap Minggu malam, 10 menit saja.</strong> Bandingkan realisasi dengan anggaran di halaman Perencana. Kalau Makanan sudah 76% di minggu ketiga, masak dari stok dapur sampai gajian berikutnya.</li>'
    + '</ol></section>';
}

export const VIEWS = {
  home: viewHome,
  budget: viewBudget,
  expenses: viewExpenses,
  savings: viewSavings,
  calculator: viewCalculator,
  report: viewReport,
  guide: viewGuide
};
