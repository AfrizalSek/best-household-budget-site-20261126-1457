// views.js — Render tiap halaman AnggaranKita v2 dari state.
// Semua angka diambil dari state.js sehingga konsisten antar halaman.
// Tesis v2: gajian ke gajian — dashboard dibuka dengan insight, bukan paragraf.

import {
  formatIDR, formatCompactIDR, formatDateID, escapeHtml,
  totalIncomeFor, totalExpenseFor, remainingFor, categorySpentFor,
  categoryTotalsFor, savingsRateFor, dailyAverageFor, monthsToFinish,
  monthlyHistory, biggestCategory, compareMonths, buildDailyFlow,
  applySavingsOnPayday, applyMarketCut, marketTotal, billsSummary, billsForMonth
} from './state.js';
import { CATEGORY_COLORS, MONTHS, FAMILY } from './data.js';
import { barChart, donutChart, progressBar, lineChart } from './charts.js';

function pctColor(pct) {
  if (pct >= 100) return '#b3261e';
  if (pct >= 75) return '#d97b29';
  return '#2e6b34';
}
function categoryName(state, id) {
  const cat = state.categories.find(c => c.id === id);
  return cat ? cat.name : 'Lainnya';
}
function monthSwitcher(state) {
  return '<div class="month-switch" role="group" aria-label="Pilih bulan">'
    + ['2026-10', '2026-11'].map(k =>
      '<button type="button" class="month-btn' + (state.month === k ? ' active' : '') + '" data-action="switch-month" data-month="' + k + '">' + MONTHS[k].short + '</button>'
    ).join('') + '</div>';
}
function statTile(label, value, note, tone) {
  return '<div class="stat-tile' + (tone ? ' tone-' + tone : '') + '">'
    + '<div class="stat-label">' + label + '</div>'
    + '<div class="stat-value">' + value + '</div>'
    + '<div class="stat-note">' + note + '</div></div>';
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
    + '<span class="goal-pct">' + pct.toFixed(0) + '%</span></div>'
    + progressBar(pct)
    + '<p class="goal-amount">' + formatIDR(goal.saved) + ' dari ' + formatIDR(goal.target) + '</p>'
    + '<p class="goal-note">' + finishText + '</p>'
    + '<details class="goal-edit"><summary>Ubah target / tabungan</summary>'
    + '<form data-form="edit-goal" data-id="' + goal.id + '">'
    + '<label>Nama<input name="name" value="' + escapeHtml(goal.name) + '" required></label>'
    + '<label>Target (Rp)<input name="target" type="number" min="0" value="' + goal.target + '" required></label>'
    + '<label>Sudah terkumpul (Rp)<input name="saved" type="number" min="0" value="' + goal.saved + '" required></label>'
    + '<label>Setoran per bulan (Rp)<input name="monthly" type="number" min="0" value="' + goal.monthly + '" required></label>'
    + '<div class="form-row"><button type="submit" class="btn">Simpan</button>'
    + '<button type="button" class="btn btn-danger" data-action="delete-goal" data-id="' + goal.id + '">Hapus</button></div>'
    + '</form></details></article>';
}

// ---------- Beranda ----------
export function renderHome(state) {
  const month = state.months[state.month];
  const meta = MONTHS[state.month];
  const income = totalIncomeFor(month);
  const expense = totalExpenseFor(month);
  const remaining = remainingFor(month);
  const flow = buildDailyFlow(state.month, month.expenses, month.incomeEvents, meta.openingBalance);
  const rate = savingsRateFor(month);
  const tabungan = categorySpentFor(month, 'cat-tabungan');
  const totals = categoryTotalsFor(month).sort((a, b) => b.spent - a.spent);
  const biggest = biggestCategory(month);
  const summary = billsSummary(state, '2026-11');
  const recent = [...month.expenses].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  const thesis = state.month === '2026-11'
    ? 'Gajian ke gajian: gaji masuk tanggal 25, tapi dompet minus ' + flow.minusDays + ' hari.'
    : 'Oktober lebih berat: dompet minus ' + flow.minusDays + ' hari sebelum gajian tanggal 25.';

  const tiles = '<section class="stat-grid" aria-label="Angka utama">'
    + statTile('Sisa bulan ini', formatIDR(remaining), (remaining / income * 100).toFixed(1) + '% dari pemasukan')
    + statTile('Titik terendah', formatIDR(flow.lowest), 'Saldo ' + flow.lowestDay + ' ' + meta.short, 'bad')
    + statTile('Hari minus', flow.minusDays + ' hari', 'Saldo akhir hari di bawah nol', flow.minusDays > 0 ? 'warn' : '')
    + statTile('Buffer yang dibutuhkan', formatIDR(flow.buffer), 'Dana cadangan supaya tidak minus')
    + '</section>';

  const donutLegend = totals.map(t =>
    '<li><span class="legend-dot" style="background:' + (CATEGORY_COLORS[t.id] || '#8a7f6a') + '"></span>'
    + '<span class="legend-name">' + escapeHtml(t.name) + '</span>'
    + '<span class="legend-value">' + formatIDR(t.spent) + ' · ' + (expense > 0 ? (t.spent / expense * 100).toFixed(1) : '0') + '%</span></li>'
  ).join('');

  const billsUpNext = summary.unpaid.length === 0
    ? '<p class="good-note">Semua ' + summary.bills.length + ' tagihan November sudah lunas (' + formatIDR(summary.paidTotal) + ').</p>'
    : '<ul class="bill-list">' + summary.unpaid.map(b =>
      '<li><span>' + escapeHtml(b.name) + ' — jatuh tempo ' + b.dueDay + ' Nov</span><strong>' + formatIDR(b.amount) + '</strong></li>'
    ).join('') + '</ul>';
  const december = summary.upcoming.map(b =>
    '<li><span>' + escapeHtml(b.name) + ' — jatuh tempo ' + b.dueDay + ' Des (rencana)</span><strong>' + formatIDR(b.amount) + '</strong></li>'
  ).join('');

  const incomeRows = month.income.map(item =>
    '<li><span>' + escapeHtml(item.source) + '</span><strong>' + formatIDR(item.amount) + '</strong>'
    + '<button type="button" class="btn-link" data-action="delete-income" data-id="' + item.id + '">Hapus</button></li>'
  ).join('');

  return '<section class="hero">'
    + '<div class="hero-top">' + monthSwitcher(state) + '<p class="hero-family">' + escapeHtml(FAMILY.name) + ' · ' + escapeHtml(FAMILY.city) + '</p></div>'
    + '<h1 class="thesis">' + thesis + '</h1>'
    + '<p class="hero-sub">Pemasukan ' + formatIDR(income) + ' · pengeluaran ' + formatIDR(expense) + ' · disisihkan ke tabungan ' + formatIDR(tabungan) + ' (' + rate.toFixed(1) + '% dari pemasukan). Sisa bulan ini ' + formatIDR(remaining) + ' (' + (remaining / income * 100).toFixed(1) + '%).</p>'
    + '</section>'
    + tiles
    + '<section class="card chart-card"><div class="card-head"><h2>Saldo harian — ' + meta.label + '</h2>'
    + '<a class="card-link" href="#/arus-harian">Lihat kalender &amp; skenario →</a></div>'
    + '<p class="chart-note">' + meta.openingNote + '</p>'
    + lineChart(flow, { height: 240, paydayDay: FAMILY.paydayDay })
    + '<p class="chart-note">Terendah ' + formatIDR(flow.lowest) + ' pada ' + flow.lowestDay + ' ' + meta.short + ' — ' + flow.minusDays + ' hari saldo di bawah nol sebelum gajian tanggal 25.</p>'
    + '</section>'
    + '<div class="grid-2">'
    + '<section class="card"><div class="card-head"><h2>Pengeluaran per kategori</h2><a class="card-link" href="#/anggaran">Anggaran →</a></div>'
    + '<div class="donut-wrap">' + donutChart(totals.map(t => ({ label: t.name, value: t.spent, color: CATEGORY_COLORS[t.id] || '#8a7f6a' }))) + '</div>'
    + '<ul class="legend">' + donutLegend + '</ul>'
    + '<p class="chart-note">Terbesar: ' + escapeHtml(biggest.name) + ' ' + formatIDR(biggest.spent) + ' (' + (biggest.spent / expense * 100).toFixed(1) + '% dari pengeluaran).</p></section>'
    + '<section class="card"><div class="card-head"><h2>Tagihan</h2><a class="card-link" href="#/tagihan">Semua tagihan →</a></div>'
    + billsUpNext
    + '<h3 class="subhead">Desember mendatang</h3><ul class="bill-list">' + december + '</ul>'
    + '<p class="chart-note">Tagihan sudah termasuk dalam pengeluaran di atas — bukan tambahan.</p></section>'
    + '</div>'
    + '<div class="grid-2">'
    + '<section class="card"><div class="card-head"><h2>Transaksi terbaru</h2><a class="card-link" href="#/pengeluaran">Semua transaksi →</a></div>'
    + '<ul class="tx-list">' + recent.map(e =>
      '<li><span class="tx-date">' + formatDateID(e.date) + '</span><span class="tx-note">' + escapeHtml(e.note) + '</span><strong>' + formatIDR(e.amount) + '</strong></li>'
    ).join('') + '</ul></section>'
    + '<section class="card"><div class="card-head"><h2>Tujuan tabungan</h2><a class="card-link" href="#/tabungan">Tabungan →</a></div>'
    + state.goals.map(g => goalCard(state, g)).join('') + '</section>'
    + '</div>'
    + '<section class="card"><div class="card-head"><h2>Pemasukan — ' + meta.label + '</h2></div>'
    + '<ul class="income-list">' + incomeRows + '</ul>'
    + '<form data-form="add-income" class="inline-form"><label>Sumber<input name="source" required placeholder="cth: Gaji Budi"></label>'
    + '<label>Jumlah (Rp)<input name="amount" type="number" min="0" required></label>'
    + '<button type="submit" class="btn">Tambah pemasukan</button></form></section>';
}

// ---------- Arus Harian ----------
export function renderDaily(state, ui) {
  const month = state.months[state.month];
  const meta = MONTHS[state.month];
  const baseFlow = buildDailyFlow(state.month, month.expenses, month.incomeEvents, meta.openingBalance);
  let effExpenses = month.expenses;
  if (ui.scenario) effExpenses = applySavingsOnPayday(effExpenses, FAMILY.paydayDay);
  if (ui.cut > 0) effExpenses = applyMarketCut(effExpenses, ui.cut);
  const effFlow = buildDailyFlow(state.month, effExpenses, month.incomeEvents, meta.openingBalance);
  const changed = ui.scenario || ui.cut > 0;
  const cutYearly = ui.cut * 12;
  const market = marketTotal(month.expenses);

  const selDay = ui.selectedDay || baseFlow.lowestDay;
  const sel = baseFlow.days.find(d => d.day === selDay) || baseFlow.days[0];

  const cells = baseFlow.days.map(d => {
    const eff = effFlow.days[d.day - 1];
    const cls = ['cal-cell'];
    if (d.balance < 0) cls.push('minus');
    if (d.day === FAMILY.paydayDay) cls.push('payday');
    if (d.day === baseFlow.lowestDay) cls.push('lowest');
    if (d.day === selDay) cls.push('selected');
    return '<button type="button" class="' + cls.join(' ') + '" data-action="select-day" data-day="' + d.day + '">'
      + '<span class="cal-day">' + d.day + '</span>'
      + '<span class="cal-bal">' + formatCompactIDR(d.balance) + '</span>'
      + (changed ? '<span class="cal-bal eff">' + formatCompactIDR(eff.balance) + '</span>' : '')
      + (d.income > 0 ? '<span class="cal-in">▲ ' + formatCompactIDR(d.income) + '</span>' : '')
      + '</button>';
  }).join('');

  const selEvents = [
    ...sel.incomeEvents.map(ev => '<li><span class="tx-note">' + escapeHtml(ev.label) + ' (masuk)</span><strong class="good">+' + formatIDR(ev.amount) + '</strong></li>'),
    ...sel.expenses.map(e => '<li><span class="tx-note">' + escapeHtml(e.note) + ' — ' + escapeHtml(categoryName(state, e.categoryId)) + '</span><strong>−' + formatIDR(e.amount) + '</strong></li>')
  ].join('') || '<li><span class="tx-note">Tidak ada transaksi hari ini.</span></li>';

  return '<section class="page-head">' + monthSwitcher(state)
    + '<h1>Arus harian — ' + meta.label + '</h1>'
    + '<p class="page-sub">Saldo dihitung hari demi hari dari saldo awal ' + formatIDR(meta.openingBalance) + '. Klik tanggal di kalender untuk melihat transaksinya.</p></section>'
    + '<section class="card controls"><h2>Coba ubah arusnya</h2>'
    + '<label class="control-row"><span><input type="checkbox" data-action="toggle-scenario" ' + (ui.scenario ? 'checked' : '') + '> Setor tabungan saat gajian (tanggal 25), bukan awal bulan</span>'
    + '<span class="control-note">Dua setor tabungan Rp1.500.000 digeser ke 25 ' + meta.short + ' — total bulan tetap sama.</span></label>'
    + '<label class="control-row"><span>Kurangi belanja pasar: <strong>Rp' + ui.cut.toLocaleString('id-ID') + '/bln</strong></span>'
    + '<input type="range" min="0" max="500000" step="50000" value="' + ui.cut + '" data-action="set-cut" aria-label="Kurangi belanja pasar per bulan">'
    + '<span class="control-note">Total belanja pasar bulan ini ' + formatIDR(market) + '. Potongan disebar ke semua belanja pasar.</span></label>'
    + '</section>'
    + '<section class="stat-grid" aria-label="Perbandingan skenario">'
    + statTile('Sekarang — titik terendah', formatIDR(baseFlow.lowest), baseFlow.lowestDay + ' ' + meta.short + ' · ' + baseFlow.minusDays + ' hari minus', 'bad')
    + statTile(changed ? 'Dengan perubahan — titik terendah' : 'Dengan perubahan', changed ? formatIDR(effFlow.lowest) : '—', changed ? effFlow.lowestDay + ' ' + meta.short + ' · ' + effFlow.minusDays + ' hari minus' : 'Aktifkan skenario atau geser slider di atas', changed ? (effFlow.lowest > baseFlow.lowest ? 'good' : '') : '')
    + statTile('Buffer yang dibutuhkan', formatIDR(baseFlow.buffer), changed ? 'Jadi ' + formatIDR(effFlow.buffer) + ' dengan perubahan' : 'Dana cadangan supaya tidak minus')
    + statTile('Tabungan ekstra per tahun', ui.cut > 0 ? formatIDR(cutYearly) : '—', ui.cut > 0 ? 'Dari potong belanja pasar Rp' + ui.cut.toLocaleString('id-ID') + '/bln' : 'Geser slider belanja pasar di atas')
    + '</section>'
    + '<section class="card chart-card"><div class="card-head"><h2>Saldo harian</h2></div>'
    + (changed ? '<p class="chart-note"><span class="legend-dot" style="background:#1f4d2e"></span> Sekarang &nbsp; <span class="legend-dot" style="background:#5a9e5f"></span> Dengan perubahan (garis putus-putus)</p>' : '')
    + lineChart(baseFlow, { height: 300, compareFlow: changed ? effFlow : null, paydayDay: FAMILY.paydayDay })
    + '<p class="chart-note">Garis merah muda di bawah nol: hari-hari saldo minus. Titik terendah ' + formatIDR(baseFlow.lowest) + ' pada ' + baseFlow.lowestDay + ' ' + meta.short + '.</p></section>'
    + '<section class="card"><div class="card-head"><h2>Kalender saldo</h2><span class="chart-note">Hijau: gajian · Merah: titik terendah · Angka hijau di bawah: saldo dengan perubahan</span></div>'
    + '<div class="calendar">' + cells + '</div></section>'
    + '<section class="card"><div class="card-head"><h2>' + selDay + ' ' + meta.label + '</h2><span class="chart-note">Saldo akhir hari: ' + formatIDR(sel.balance) + '</span></div>'
    + '<ul class="tx-list">' + selEvents + '</ul></section>';
}

// ---------- Tagihan ----------
export function renderBills(state) {
  const summary = billsSummary(state, '2026-11');
  const rows = summary.bills.map(b => {
    const paid = state.billsPaid[b.id];
    return '<tr><td>' + escapeHtml(b.name) + '</td><td class="num">' + formatIDR(b.amount) + '</td>'
      + '<td class="num">' + b.dueDay + ' Nov</td><td>' + (b.paidDate ? formatDateID(b.paidDate) : '—') + '</td>'
      + '<td>' + (paid ? '<span class="badge paid">Lunas</span>' : '<span class="badge due">Belum lunas</span>') + '</td>'
      + '<td><button type="button" class="btn btn-small" data-action="toggle-bill" data-id="' + b.id + '">' + (paid ? 'Tandai belum lunas' : 'Tandai lunas') + '</button></td></tr>';
  }).join('');
  const upcomingRows = summary.upcoming.map(b =>
    '<tr><td>' + escapeHtml(b.name) + '</td><td class="num">' + formatIDR(b.amount) + '</td><td class="num">' + b.dueDay + ' Des</td><td>Rencana</td><td><span class="badge upcoming">Mendatang</span></td><td>Belum masuk pengeluaran November</td></tr>'
  ).join('');

  return '<section class="page-head"><h1>Tagihan</h1>'
    + '<p class="page-sub">Tagihan adalah tampilan dari pengeluaran yang sama — sudah dihitung di halaman Pengeluaran, bukan tambahan. Menandai lunas hanya mengubah status, bukan angka.</p></section>'
    + '<section class="stat-grid">'
    + statTile('Total tagihan November', formatIDR(summary.total), summary.bills.length + ' tagihan')
    + statTile('Sudah lunas', formatIDR(summary.paidTotal), summary.paid.length + ' dari ' + summary.bills.length + ' tagihan', 'good')
    + statTile('Belum lunas', formatIDR(summary.unpaidTotal), summary.unpaid.length + ' tagihan', summary.unpaid.length > 0 ? 'warn' : '')
    + statTile('Desember mendatang', formatIDR(summary.upcoming.reduce((s, b) => s + b.amount, 0)), summary.upcoming.length + ' tagihan rencana')
    + '</section>'
    + '<section class="card"><div class="card-head"><h2>November 2026</h2></div>'
    + '<div class="table-wrap"><table><thead><tr><th>Tagihan</th><th>Jumlah</th><th>Jatuh tempo</th><th>Dibayar</th><th>Status</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div></section>'
    + '<section class="card"><div class="card-head"><h2>Desember 2026 — mendatang</h2></div>'
    + '<div class="table-wrap"><table><thead><tr><th>Tagihan</th><th>Jumlah</th><th>Jatuh tempo</th><th>Status</th><th></th><th>Catatan</th></tr></thead><tbody>' + upcomingRows + '</tbody></table></div>'
    + '<p class="chart-note">Cicilan motor sengaja tidak dimasukkan: tidak ada di data awal keluarga dan jumlahnya tidak boleh dikarang. Kalau ada cicilannya, tambahkan sebagai tagihan di sini dan sebagai pengeluaran di halaman Pengeluaran.</p></section>';
}

// ---------- Anggaran ----------
export function renderBudget(state) {
  const month = state.months[state.month];
  const meta = MONTHS[state.month];
  const expense = totalExpenseFor(month);
  const totals = categoryTotalsFor(month).sort((a, b) => b.spent - a.spent);
  const rows = totals.map(cat => {
    const pct = cat.budget > 0 ? (cat.spent / cat.budget) * 100 : 0;
    const color = pctColor(pct);
    const status = pct >= 100 ? 'Melebihi anggaran' : pct >= 75 ? 'Mendekati batas' : 'Aman';
    return '<tr><td><span class="legend-dot" style="background:' + (CATEGORY_COLORS[cat.id] || '#8a7f6a') + '"></span> ' + escapeHtml(cat.name) + '</td>'
      + '<td class="num">' + formatIDR(cat.spent) + '</td><td class="num">' + formatIDR(cat.budget) + '</td>'
      + '<td class="num">' + pct.toFixed(0) + '%</td>'
      + '<td><div class="mini-bar"><div class="mini-fill" style="width:' + Math.min(pct, 100) + '%;background:' + color + '"></div></div></td>'
      + '<td>' + status + '</td>'
      + '<td><button type="button" class="btn-link" data-action="delete-category" data-id="' + cat.id + '">Hapus</button></td></tr>';
  }).join('');

  return '<section class="page-head">' + monthSwitcher(state)
    + '<h1>Anggaran — ' + meta.label + '</h1>'
    + '<p class="page-sub">Total anggaran ' + formatIDR(state.categories.reduce((s, c) => s + c.budget, 0)) + ' · terpakai ' + formatIDR(expense) + ' (' + (expense / totalIncomeFor(month) * 100).toFixed(1) + '% dari pemasukan).</p></section>'
    + '<section class="card"><div class="card-head"><h2>Per kategori</h2></div>'
    + '<div class="donut-wrap">' + donutChart(totals.map(t => ({ label: t.name, value: t.spent, color: CATEGORY_COLORS[t.id] || '#8a7f6a' }))) + '</div>'
    + '<div class="table-wrap"><table><thead><tr><th>Kategori</th><th>Terpakai</th><th>Anggaran</th><th>%</th><th></th><th>Status</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div></section>'
    + '<section class="card"><h2>Tambah kategori</h2>'
    + '<form data-form="add-category" class="inline-form"><label>Nama<input name="name" required placeholder="cth: Langganan"></label>'
    + '<label>Anggaran (Rp)<input name="budget" type="number" min="0" required></label>'
    + '<button type="submit" class="btn">Tambah kategori</button></form></section>';
}

// ---------- Pengeluaran ----------
export function renderExpenses(state) {
  const month = state.months[state.month];
  const meta = MONTHS[state.month];
  const sorted = [...month.expenses].sort((a, b) => b.date.localeCompare(a.date));
  const rows = sorted.map(e =>
    '<tr><td>' + formatDateID(e.date) + '</td><td>' + escapeHtml(e.note) + '</td><td>' + escapeHtml(categoryName(state, e.categoryId)) + '</td>'
    + '<td class="num">' + formatIDR(e.amount) + '</td>'
    + '<td><button type="button" class="btn-link" data-action="delete-expense" data-id="' + e.id + '">Hapus</button></td></tr>'
  ).join('');
  const options = state.categories.map(c => '<option value="' + c.id + '">' + escapeHtml(c.name) + '</option>').join('');

  return '<section class="page-head">' + monthSwitcher(state)
    + '<h1>Pengeluaran — ' + meta.label + '</h1>'
    + '<p class="page-sub">' + month.expenses.length + ' transaksi · total ' + formatIDR(totalExpenseFor(month)) + ' · rata-rata ' + formatIDR(dailyAverageFor(month, meta.days)) + ' per hari.</p></section>'
    + '<section class="card"><div class="card-head"><h2>Semua transaksi</h2></div>'
    + '<div class="table-wrap"><table><thead><tr><th>Tanggal</th><th>Catatan</th><th>Kategori</th><th>Jumlah</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div></section>'
    + '<section class="card"><h2>Tambah pengeluaran</h2>'
    + '<form data-form="add-expense" class="inline-form"><label>Tanggal<input name="date" type="date" value="' + state.month + '-01" required></label>'
    + '<label>Catatan<input name="note" required placeholder="cth: Belanja Pasar Tuban"></label>'
    + '<label>Kategori<select name="categoryId">' + options + '</select></label>'
    + '<label>Jumlah (Rp)<input name="amount" type="number" min="0" required></label>'
    + '<button type="submit" class="btn">Tambah pengeluaran</button></form></section>';
}

// ---------- Tabungan ----------
export function renderSavings(state) {
  const month = state.months[state.month];
  const meta = MONTHS[state.month];
  const tabungan = categorySpentFor(month, 'cat-tabungan');
  const rate = savingsRateFor(month);
  const totalSaved = state.goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = state.goals.reduce((s, g) => s + g.target, 0);

  return '<section class="page-head">' + monthSwitcher(state)
    + '<h1>Tabungan</h1>'
    + '<p class="page-sub">Disisihkan ke tabungan ' + formatIDR(tabungan) + ' (' + rate.toFixed(1) + '% dari pemasukan ' + meta.label + ') — terpisah dari sisa bulan ini ' + formatIDR(remainingFor(month)) + ' (' + (remainingFor(month) / totalIncomeFor(month) * 100).toFixed(1) + '%).</p></section>'
    + '<section class="stat-grid">'
    + statTile('Disisihkan bulan ini', formatIDR(tabungan), rate.toFixed(1) + '% dari pemasukan')
    + statTile('Total terkumpul', formatIDR(totalSaved), 'dari target ' + formatIDR(totalTarget))
    + statTile('Sisa bulan ini', formatIDR(remainingFor(month)), 'Bisa ditambah ke tabungan')
    + '</section>'
    + '<div class="goal-grid">' + state.goals.map(g => goalCard(state, g)).join('') + '</div>'
    + '<section class="card"><h2>Tambah tujuan tabungan</h2>'
    + '<form data-form="add-goal" class="inline-form"><label>Nama tujuan<input name="name" required placeholder="cth: Dana pendidikan anak"></label>'
    + '<label>Target (Rp)<input name="target" type="number" min="0" required></label>'
    + '<label>Sudah terkumpul (Rp)<input name="saved" type="number" min="0" value="0" required></label>'
    + '<label>Setoran per bulan (Rp)<input name="monthly" type="number" min="0" value="0" required></label>'
    + '<button type="submit" class="btn">Tambah tujuan</button></form></section>';
}

// ---------- Kalkulator ----------
export function renderCalculator() {
  return '<section class="page-head"><h1>Kalkulator</h1>'
    + '<p class="page-sub">Tiga kalkulator keluarga — semua dihitung di perangkatmu, tanpa data dikirim ke mana pun.</p></section>'
    + '<div class="grid-2">'
    + '<section class="card"><h2>Aturan 50/30/20</h2><p class="card-desc">Bagi pemasukan: 50% kebutuhan, 30% keinginan, 20% tabungan.</p>'
    + '<form data-calc="fifty" class="calc-form"><label>Pemasukan bulanan (Rp)<input name="income" type="number" min="0" value="10300000" required></label>'
    + '<button type="submit" class="btn">Hitung</button></form><div class="calc-result" data-result="fifty"></div></section>'
    + '<section class="card"><h2>Dana darurat</h2><p class="card-desc">Target ideal: 6 bulan pengeluaran. Berapa lama mencapainya dengan setoranmu?</p>'
    + '<form data-calc="emergency" class="calc-form"><label>Pengeluaran bulanan (Rp)<input name="expense" type="number" min="0" value="6274000" required></label>'
    + '<label>Setoran per bulan (Rp)<input name="monthly" type="number" min="0" value="1000000" required></label>'
    + '<label>Sudah terkumpul (Rp)<input name="saved" type="number" min="0" value="7250000" required></label>'
    + '<button type="submit" class="btn">Hitung</button></form><div class="calc-result" data-result="emergency"></div></section>'
    + '</div>'
    + '<section class="card"><h2>Cicilan — berapa yang aman?</h2><p class="card-desc">Cicilan aman maksimal 30% dari pemasukan. Hitung cicilan bulanan dari harga, DP, bunga, dan tenor.</p>'
    + '<form data-calc="loan" class="calc-form"><label>Harga barang (Rp)<input name="price" type="number" min="0" value="20000000" required></label>'
    + '<label>Uang muka (Rp)<input name="down" type="number" min="0" value="5000000" required></label>'
    + '<label>Bunga per tahun (%)<input name="rate" type="number" min="0" step="0.1" value="12" required></label>'
    + '<label>Tenor (bulan)<input name="months" type="number" min="1" value="24" required></label>'
    + '<label>Pemasukan bulanan (Rp)<input name="income" type="number" min="0" value="10300000" required></label>'
    + '<button type="submit" class="btn">Hitung</button></form><div class="calc-result" data-result="loan"></div></section>';
}

// ---------- Laporan ----------
export function renderReport(state) {
  const cmp = compareMonths(state);
  const hist = monthlyHistory(state);
  const movers = [...cmp.rows].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  const top = movers.slice(0, 3);
  const moverText = top.map(r =>
    escapeHtml(r.name) + ' ' + (r.delta < 0 ? 'turun' : 'naik') + ' ' + formatIDR(Math.abs(r.delta))
    + ' (' + formatIDR(r.octSpent) + ' → ' + formatIDR(r.novSpent) + ')'
  ).join(', ');
  const narrative = 'November lebih baik dari Oktober: sisa naik ' + formatIDR(cmp.novRemaining - cmp.octRemaining)
    + ' (' + formatIDR(cmp.octRemaining) + ' → ' + formatIDR(cmp.novRemaining) + ') karena pengeluaran turun '
    + formatIDR(cmp.octExpense - cmp.novExpense) + ' meski pemasukan turun ' + formatIDR(cmp.octIncome - cmp.novIncome) + '. '
    + 'Perubahan terbesar: ' + moverText + '. '
    + 'Titik terendah naik ' + formatIDR(cmp.novFlow.lowest - cmp.octFlow.lowest)
    + ' (' + formatIDR(cmp.octFlow.lowest) + ' → ' + formatIDR(cmp.novFlow.lowest) + ') dan hari minus berkurang dari '
    + cmp.octFlow.minusDays + ' menjadi ' + cmp.novFlow.minusDays + ' hari. '
    + 'Penyebab utama: Oktober ada pembelian kipas angin Rp350.000 dan belanja pasar lebih besar; November tidak ada pembelian besar.';

  const rows = cmp.rows.map(r =>
    '<tr><td>' + escapeHtml(r.name) + '</td><td class="num">' + formatIDR(r.octSpent) + '</td><td class="num">' + formatIDR(r.novSpent) + '</td>'
    + '<td class="num ' + (r.delta < 0 ? 'good' : r.delta > 0 ? 'bad' : '') + '">' + (r.delta > 0 ? '+' : '') + formatIDR(r.delta) + '</td></tr>'
  ).join('');

  return '<section class="page-head"><h1>Laporan — November vs Oktober 2026</h1>'
    + '<p class="page-sub">Perbandingan dua bulan penuh, dihitung dari data yang sama dengan halaman lain.</p></section>'
    + '<section class="card"><h2>Apa yang berubah dan kenapa</h2><p class="narrative">' + narrative + '</p></section>'
    + '<section class="stat-grid">'
    + statTile('Sisa November', formatIDR(cmp.novRemaining), 'Oktober ' + formatIDR(cmp.octRemaining) + ' · +' + formatIDR(cmp.novRemaining - cmp.octRemaining), 'good')
    + statTile('Titik terendah', formatIDR(cmp.novFlow.lowest), 'Oktober ' + formatIDR(cmp.octFlow.lowest) + ' · +' + formatIDR(cmp.novFlow.lowest - cmp.octFlow.lowest))
    + statTile('Hari minus', cmp.novFlow.minusDays + ' hari', 'Oktober ' + cmp.octFlow.minusDays + ' hari · −' + (cmp.octFlow.minusDays - cmp.novFlow.minusDays) + ' hari', 'good')
    + statTile('Pengeluaran', formatIDR(cmp.novExpense), 'Oktober ' + formatIDR(cmp.octExpense) + ' · −' + formatIDR(cmp.octExpense - cmp.novExpense))
    + '</section>'
    + '<section class="card"><div class="card-head"><h2>Per kategori</h2></div>'
    + '<div class="table-wrap"><table><thead><tr><th>Kategori</th><th>Oktober</th><th>November</th><th>Selisih</th></tr></thead><tbody>' + rows + '</tbody></table></div></section>'
    + '<section class="card"><div class="card-head"><h2>Enam bulan terakhir</h2></div>'
    + barChart(hist)
    + '<p class="chart-note">Pemasukan stabil di kisaran Rp10,1–10,45 juta; pengeluaran November ' + formatIDR(cmp.novExpense) + ' adalah yang terendah kedua setelah Agustus.</p></section>';
}

// ---------- Panduan ----------
export function renderGuide() {
  return '<section class="page-head"><h1>Panduan mengelola uang keluarga</h1>'
    + '<p class="page-sub">Cara praktis memakai AnggaranKita untuk keluarga dengan gaji bulanan dan usaha kecil.</p></section>'
    + '<section class="card"><h2>1. Pikirkan gajian ke gajian, bukan bulan ke bulan</h2>'
    + '<p>Gaji masuk tanggal 25, tapi belanja jalan terus dari tanggal 1. Yang menentukan dompetmu bukan total bulanan — melainkan saldo di hari paling tipis. Di keluarga Prasetyo, saldo terendah November adalah −Rp1.904.000 pada 24 November, sehari sebelum gajian. Artinya keluarga ini butuh buffer sekitar Rp2.000.000 di awal bulan supaya tidak minus.</p>'
    + '<p><strong>Aturan praktis:</strong> sisihkan dana buffer di awal bulan, atau geser setor tabungan ke tanggal gajian (coba di halaman Arus Harian — titik terendah naik Rp1.500.000).</p></section>'
    + '<section class="card"><h2>2. Aturan 50/30/20</h2>'
    + '<p>Bagi pemasukan jadi tiga: 50% kebutuhan (makan, listrik, SPP), 30% keinginan (hiburan, jajan), 20% tabungan. Dengan pemasukan Rp10.300.000: kebutuhan Rp5.150.000, keinginan Rp3.090.000, tabungan Rp2.060.000. Keluarga Prasetyo baru menyisihkan 14,6% — masih di bawah 20%, tapi sudah di atas banyak keluarga. Naikkan sedikit demi sedikit.</p></section>'
    + '<section class="card"><h2>3. Dana darurat dulu, renovasi kemudian</h2>'
    + '<p>Dana darurat ideal 6 bulan pengeluaran — untuk keluarga ini sekitar Rp37,6 juta. Saat ini terkumpul Rp7.250.000. Isi dana darurat sebelum renovasi dapur, karena darurat tidak bisa menunggu.</p></section>'
    + '<section class="card"><h2>4. Catat tagihan dengan tanggal jatuh tempo</h2>'
    + '<p>SPP tanggal 5, token listrik tanggal 10 dan 20, BPJS tanggal 10, PDAM tanggal 15, arisan tanggal 15. Tulis semuanya di halaman Tagihan dan tandai lunas begitu dibayar — tagihan yang telat biasanya berbunga atau kena denda.</p></section>'
    + '<section class="card"><h2>5. Belanja pasar seminggu sekali</h2>'
    + '<p>Belanja pasar keluarga ini Rp1.330.000 sebulan. Kurangi Rp200.000 sebulan saja — misalnya dengan daftar belanja dan tidak jajan di pasar — dan tabungan bertambah Rp2.400.000 setahun. Coba slider-nya di halaman Arus Harian.</p></section>'
    + '<section class="card"><h2>Istilah yang dipakai di situs ini</h2>'
    + '<ul class="guide-list"><li><strong>Titik terendah</strong> — saldo paling kecil dalam sebulan (biasanya sehari sebelum gajian).</li>'
    + '<li><strong>Hari minus</strong> — jumlah hari dengan saldo akhir di bawah nol.</li>'
    + '<li><strong>Buffer</strong> — dana cadangan yang dibutuhkan supaya saldo tidak pernah minus.</li>'
    + '<li><strong>Disisihkan ke tabungan</strong> — uang yang dipindah ke tabungan (14,6% dari pemasukan).</li>'
    + '<li><strong>Sisa bulan ini</strong> — pemasukan dikurangi semua pengeluaran, termasuk tabungan (39,1% dari pemasukan).</li></ul></section>';
}

export const VIEWS = {
  home: renderHome,
  daily: renderDaily,
  bills: renderBills,
  budget: renderBudget,
  expenses: renderExpenses,
  savings: renderSavings,
  calculator: renderCalculator,
  report: renderReport,
  guide: renderGuide
};
