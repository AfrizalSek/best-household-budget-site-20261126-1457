// charts.js — Grafik SVG murni AnggaranKita v2, tanpa library dan tanpa network.
// Dataviz: bentuk dipilih sesuai tugas data; warna kategori tetap (hue tidak
// di-cycle); legenda untuk 2+ seri, direct label untuk titik kunci; hover
// crosshair + tooltip disambung di main.js lewat .dot per hari.

import { formatIDR, formatCompactIDR, escapeHtml } from './state.js';

// ---------- Line chart saldo harian (elemen memorable) ----------
// flow: hasil buildDailyFlow. opts: { height, compareFlow (skenario), paydayDay }
export function lineChart(flow, opts = {}) {
  const width = 640;
  const height = opts.height || 320;
  const padLeft = 56;
  const padRight = 14;
  const padTop = 26;
  const padBottom = 30;
  const chartWidth = width - padLeft - padRight;
  const chartHeight = height - padTop - padBottom;
  const days = flow.days;
  const n = days.length;

  const allValues = [...days.map(d => d.balance)];
  if (opts.compareFlow) allValues.push(...opts.compareFlow.days.map(d => d.balance));
  let min = Math.min(0, ...allValues);
  let max = Math.max(0, ...allValues);
  const step = 2000000;
  // Batas sumbu dibulatkan ke 1 jt (grid tetap tiap 2 jt) supaya tidak ada
  // ruang kosong besar di atas garis.
  min = Math.floor(min / 1000000) * 1000000;
  max = Math.ceil(max / 1000000) * 1000000;
  if (max - min < step) max = min + step;

  const x = day => padLeft + ((day - 1) / (n - 1)) * chartWidth;
  const y = v => padTop + ((max - v) / (max - min)) * chartHeight;
  const yZero = y(0);

  // Grid + label sumbu Y (langkah 2 jt).
  let grid = '';
  for (let v = min; v <= max; v += step) {
    const gy = y(v);
    const isZero = v === 0;
    grid += '<line x1="' + padLeft + '" y1="' + gy + '" x2="' + (width - padRight) + '" y2="' + gy
      + '" stroke="' + (isZero ? '#8a7f6a' : '#e5dcc8') + '" stroke-width="' + (isZero ? 1.5 : 1) + '" />'
      + '<text x="' + (padLeft - 8) + '" y="' + (gy + 4) + '" text-anchor="end" font-size="11" fill="#8a7f6a">'
      + (v === 0 ? '0' : formatCompactIDR(v)) + '</text>';
  }
  // Label sumbu X.
  let xLabels = '';
  for (let d = 1; d <= n; d++) {
    if (d === 1 || d % 5 === 0 || d === n) {
      xLabels += '<text x="' + x(d) + '" y="' + (height - 8) + '" text-anchor="middle" font-size="11" fill="#8a7f6a">' + d + '</text>';
    }
  }

  // Garis saldo: polyline halus (titik-titik dihubungkan lurus, data harian).
  const points = days.map(d => `${x(d.day).toFixed(1)},${y(d.balance).toFixed(1)}`).join(' ');
  const line = '<polyline points="' + points + '" fill="none" stroke="#1f4d2e" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />';

  // Area negatif: poligon garis↔nol, di-clip ke daerah di bawah garis nol.
  const areaPath = 'M' + x(1) + ',' + yZero + ' ' + days.map(d => 'L' + x(d.day).toFixed(1) + ',' + y(d.balance).toFixed(1)).join(' ') + ' L' + x(n) + ',' + yZero + ' Z';
  const negArea = '<clipPath id="below-zero"><rect x="' + padLeft + '" y="' + yZero + '" width="' + chartWidth + '" height="' + (padTop + chartHeight - yZero + 2) + '" /></clipPath>'
    + '<path d="' + areaPath + '" fill="#b3261e" fill-opacity="0.10" clip-path="url(#below-zero)" />';

  // Garis skenario (jika ada): putus-putus hijau sage.
  let compare = '';
  if (opts.compareFlow) {
    const cPoints = opts.compareFlow.days.map(d => `${x(d.day).toFixed(1)},${y(d.balance).toFixed(1)}`).join(' ');
    compare = '<polyline points="' + cPoints + '" fill="none" stroke="#5a9e5f" stroke-width="2" stroke-dasharray="6 4" stroke-linejoin="round" />'
      + '<circle cx="' + x(opts.compareFlow.lowestDay) + '" cy="' + y(opts.compareFlow.lowest) + '" r="4" fill="#5a9e5f" stroke="#faf7f0" stroke-width="1.5" />'
      + '<text x="' + Math.min(x(opts.compareFlow.lowestDay) + 10, width - 130) + '" y="' + (y(opts.compareFlow.lowest) - 10) + '" font-size="11" font-weight="700" fill="#5a9e5f">Skenario: ' + formatCompactIDR(opts.compareFlow.lowest) + '</text>';
  }

  // Marker: titik terendah (merah, r=5), gajian (emas, r=4), akhir (daun, r=4).
  const lowest = flow.days.find(d => d.day === flow.lowestDay) || flow.days[flow.days.length - 1];
  const payday = flow.days.find(d => d.day === (opts.paydayDay || 25));
  const last = flow.days[flow.days.length - 1];
  let markers = '';
  markers += '<circle cx="' + x(lowest.day) + '" cy="' + y(lowest.balance) + '" r="5" fill="#b3261e" stroke="#faf7f0" stroke-width="1.5" />';
  if (payday) {
    markers += '<circle cx="' + x(payday.day) + '" cy="' + y(payday.balance) + '" r="4" fill="#c98a1b" stroke="#faf7f0" stroke-width="1.5" />';
  }
  markers += '<circle cx="' + x(last.day) + '" cy="' + y(last.balance) + '" r="4" fill="#1f4d2e" stroke="#faf7f0" stroke-width="1.5" />';

  // Direct label: titik terendah di atas titiknya; gajian di atas titiknya.
  const lowestLabelX = Math.max(padLeft + 4, Math.min(x(lowest.day) - 62, width - padRight - 128));
  const labels = '<text x="' + lowestLabelX + '" y="' + (y(lowest.balance) - 12) + '" font-size="12" font-weight="700" fill="#b3261e">Titik terendah ' + formatCompactIDR(lowest.balance) + '</text>'
    + (payday
      ? '<text x="' + Math.max(padLeft + 4, Math.min(x(payday.day) - 30, width - padRight - 110)) + '" y="' + Math.max(padTop + 2, y(payday.balance) - 12) + '" font-size="12" font-weight="700" fill="#8a6a0a">Gajian ' + payday.day + ' Nov</text>'
      : '');

  // Hit area per hari (crosshair + tooltip di main.js).
  let dots = '';
  days.forEach(d => {
    dots += '<circle class="dot" data-day="' + d.day + '" data-balance="' + d.balance + '" data-income="' + d.income + '" data-expense="' + d.expense + '" cx="' + x(d.day) + '" cy="' + y(d.balance) + '" r="9" fill="transparent" />';
  });
  const crosshair = '<line class="crosshair" x1="0" y1="' + padTop + '" x2="0" y2="' + (padTop + chartHeight) + '" stroke="#1f4d2e" stroke-width="1" stroke-dasharray="3 3" opacity="0" />';

  return '<div class="chart-wrap"><svg class="daily-line" viewBox="0 0 ' + width + ' ' + height + '" role="img" aria-label="Grafik saldo harian: terendah ' + formatIDR(flow.lowest) + ' pada hari ke-' + flow.lowestDay + ', ' + flow.minusDays + ' hari minus">'
    + grid + negArea + line + compare + markers + labels + xLabels + crosshair + dots
    + '</svg><div class="chart-tip" hidden></div></div>';
}

// ---------- Donat: pengeluaran per kategori ----------
// slices: [{ label, value, color }] — warna tetap per kategori, bukan cycle.
export function donutChart(slices) {
  const size = 260;
  const center = size / 2;
  const radius = 84;
  const circumference = 2 * Math.PI * radius;
  const total = slices.reduce((sum, s) => sum + s.value, 0);

  let rings = '';
  let offset = 0;
  slices.forEach(slice => {
    if (total <= 0 || slice.value <= 0) return;
    const fraction = slice.value / total;
    const dash = fraction * circumference;
    rings += '<circle cx="' + center + '" cy="' + center + '" r="' + radius + '" fill="none" stroke="' + slice.color + '" stroke-width="34"'
      + ' stroke-dasharray="' + Math.max(dash - 2, 0) + ' ' + circumference + '"'
      + ' stroke-dashoffset="' + (-offset) + '" transform="rotate(-90 ' + center + ' ' + center + ')">'
      + '<title>' + escapeHtml(slice.label) + ': ' + formatIDR(slice.value) + ' (' + (fraction * 100).toFixed(1) + '%)</title></circle>';
    offset += dash;
  });

  const centerText = total > 0
    ? '<text x="' + center + '" y="' + (center - 6) + '" text-anchor="middle" font-size="13" fill="#5a5245">Total</text>'
      + '<text x="' + center + '" y="' + (center + 16) + '" text-anchor="middle" font-size="15" font-weight="700" fill="#2e3a2e">' + formatIDR(total) + '</text>'
    : '<text x="' + center + '" y="' + center + '" text-anchor="middle" font-size="14" fill="#5a5245">Belum ada data</text>';

  return '<svg viewBox="0 0 ' + size + ' ' + size + '" role="img" aria-label="Donat pengeluaran per kategori, total ' + formatIDR(total) + '">'
    + rings + centerText + '</svg>';
}

// ---------- Bar berpasangan: pemasukan vs pengeluaran 6 bulan ----------
// rows: [{ label, income, expense }]. Legenda 2 seri di dalam SVG.
export function barChart(rows) {
  const width = 640;
  const height = 300;
  const padLeft = 64;
  const padBottom = 30;
  const padTop = 30;
  const chartWidth = width - padLeft - 16;
  const chartHeight = height - padTop - padBottom;
  const maxValue = Math.max(...rows.map(r => Math.max(r.income, r.expense)), 1);
  const niceMax = Math.ceil(maxValue / 5000000) * 5000000;
  const groupWidth = chartWidth / rows.length;
  const barWidth = Math.min(26, (groupWidth - 18) / 2);

  let bars = '';
  rows.forEach((row, i) => {
    const groupX = padLeft + i * groupWidth + groupWidth / 2;
    const incomeH = (row.income / niceMax) * chartHeight;
    const expenseH = (row.expense / niceMax) * chartHeight;
    const yBase = padTop + chartHeight;
    bars += '<rect x="' + (groupX - barWidth - 2) + '" y="' + (yBase - incomeH) + '" width="' + barWidth + '" height="' + incomeH + '" rx="3" fill="#2e6b34">'
      + '<title>' + escapeHtml(row.label) + ' pemasukan ' + formatIDR(row.income) + '</title></rect>';
    bars += '<rect x="' + (groupX + 2) + '" y="' + (yBase - expenseH) + '" width="' + barWidth + '" height="' + expenseH + '" rx="3" fill="#d97b29">'
      + '<title>' + escapeHtml(row.label) + ' pengeluaran ' + formatIDR(row.expense) + '</title></rect>';
    bars += '<text x="' + groupX + '" y="' + (yBase + 20) + '" text-anchor="middle" font-size="12" fill="#5a5245">' + escapeHtml(row.label) + '</text>';
  });

  let grid = '';
  for (let step = 0; step <= 2; step += 1) {
    const value = (niceMax / 2) * step;
    const y = padTop + chartHeight - (value / niceMax) * chartHeight;
    grid += '<line x1="' + padLeft + '" y1="' + y + '" x2="' + (width - 16) + '" y2="' + y + '" stroke="#e5dcc8" stroke-width="1" />'
      + '<text x="' + (padLeft - 8) + '" y="' + (y + 4) + '" text-anchor="end" font-size="11" fill="#8a7f6a">' + (value / 1000000) + ' jt</text>';
  }

  const legend = '<g font-size="12" fill="#2e3a2e">'
    + '<rect x="' + (width - 230) + '" y="8" width="12" height="12" rx="2" fill="#2e6b34" /><text x="' + (width - 214) + '" y="18">Pemasukan</text>'
    + '<rect x="' + (width - 118) + '" y="8" width="12" height="12" rx="2" fill="#d97b29" /><text x="' + (width - 102) + '" y="18">Pengeluaran</text></g>';

  return '<svg viewBox="0 0 ' + width + ' ' + height + '" role="img" aria-label="Grafik batang pemasukan dan pengeluaran enam bulan terakhir">'
    + legend + grid + bars + '</svg>';
}

// Bar progres horizontal untuk tujuan tabungan.
export function progressBar(percent, color) {
  const safe = Math.max(0, Math.min(100, percent));
  const fill = color || '#2e6b34';
  return '<div class="progress" role="progressbar" aria-valuenow="' + Math.round(safe) + '" aria-valuemin="0" aria-valuemax="100">'
    + '<div class="progress-fill" style="width:' + safe + '%;background:' + fill + '"></div></div>';
}
