// charts.js — Grafik SVG murni, tanpa library dan tanpa network.
// Setiap fungsi menerima data dan mengembalikan string SVG.

import { formatIDR, escapeHtml } from './state.js';

function barColor(index) {
  const palette = ['#2e6b34', '#5a9e5f', '#8fbc8f', '#c9a227', '#d97b29', '#7a9e7e'];
  return palette[index % palette.length];
}

// Grafik batang: pemasukan vs pengeluaran per bulan.
export function barChart(rows) {
  const width = 640;
  const height = 300;
  const padLeft = 64;
  const padBottom = 30;
  const padTop = 18;
  const chartWidth = width - padLeft - 16;
  const chartHeight = height - padTop - padBottom;
  const maxValue = Math.max(...rows.map((r) => Math.max(r.income, r.expense)), 1);
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

  return '<svg viewBox="0 0 ' + width + ' ' + height + '" role="img" aria-label="Grafik batang pemasukan dan pengeluaran enam bulan terakhir">'
    + grid + bars + '</svg>';
}

// Donat: pengeluaran per kategori.
export function donutChart(slices) {
  const size = 260;
  const center = size / 2;
  const radius = 84;
  const circumference = 2 * Math.PI * radius;
  const total = slices.reduce((sum, s) => sum + s.value, 0);

  let rings = '';
  let offset = 0;
  slices.forEach((slice, i) => {
    if (total <= 0 || slice.value <= 0) return;
    const fraction = slice.value / total;
    const dash = fraction * circumference;
    rings += '<circle cx="' + center + '" cy="' + center + '" r="' + radius + '" fill="none" stroke="' + barColor(i) + '" stroke-width="34"'
      + ' stroke-dasharray="' + Math.max(dash - 2, 0) + ' ' + circumference + '"'
      + ' stroke-dashoffset="' + (-offset) + '" transform="rotate(-90 ' + center + ' ' + center + ')">'
      + '<title>' + escapeHtml(slice.label) + ': ' + formatIDR(slice.value) + '</title></circle>';
    offset += dash;
  });

  const centerText = total > 0
    ? '<text x="' + center + '" y="' + (center - 6) + '" text-anchor="middle" font-size="13" fill="#5a5245">Total</text>'
      + '<text x="' + center + '" y="' + (center + 16) + '" text-anchor="middle" font-size="15" font-weight="700" fill="#2e3a2e">' + formatIDR(total) + '</text>'
    : '<text x="' + center + '" y="' + center + '" text-anchor="middle" font-size="14" fill="#5a5245">Belum ada data</text>';

  return '<svg viewBox="0 0 ' + size + ' ' + size + '" role="img" aria-label="Donat pengeluaran per kategori">'
    + rings + centerText + '</svg>';
}

// Bar progres horizontal untuk tujuan tabungan (dipakai juga di halaman tabungan).
export function progressBar(percent, color) {
  const safe = Math.max(0, Math.min(100, percent));
  const fill = color || '#2e6b34';
  return '<div class="progress" role="progressbar" aria-valuenow="' + Math.round(safe) + '" aria-valuemin="0" aria-valuemax="100">'
    + '<div class="progress-fill" style="width:' + safe + '%;background:' + fill + '"></div></div>';
}
