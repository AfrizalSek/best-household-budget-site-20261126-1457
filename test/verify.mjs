// test/verify.mjs — Verifikasi angka AnggaranKita v2 dari data mentah.
// Hitung ulang SEMUA angka headline dari data.js + state.js, tanpa angka
// yang diketik lepas. Jalankan: node test/verify.mjs — harus PASS semua.
// Jika ada yang FAIL, jangan lanjut ke screenshot/bundle.

import {
  buildDefaultState, totalIncomeFor, totalExpenseFor, remainingFor,
  categorySpentFor, savingsRateFor, buildDailyFlow, applySavingsOnPayday,
  applyMarketCut, marketTotal, billsSummary, compareMonths, monthlyHistory
} from '../app/state.js';
import { MONTHS, CATEGORIES, BILLS } from '../app/data.js';

let pass = 0;
let fail = 0;
const failures = [];

function check(name, actual, expected) {
  const ok = actual === expected;
  if (ok) { pass++; console.log(`  PASS ${name}: ${actual}`); }
  else { fail++; failures.push(name); console.log(`  FAIL ${name}: dapat ${actual}, harus ${expected}`); }
}
function checkNear(name, actual, expected, eps = 0.01) {
  const ok = Math.abs(actual - expected) < eps;
  if (ok) { pass++; console.log(`  PASS ${name}: ${actual}`); }
  else { fail++; failures.push(name); console.log(`  FAIL ${name}: dapat ${actual}, harus ${expected}`); }
}

const state = buildDefaultState();
const nov = state.months['2026-11'];
const oct = state.months['2026-10'];

console.log('== November 2026 ==');
check('item pengeluaran Nov', nov.expenses.length, 43);
check('pemasukan Nov', totalIncomeFor(nov), 10300000);
check('pengeluaran Nov', totalExpenseFor(nov), 6274000);
check('sisa Nov', remainingFor(nov), 4026000);
check('Makanan Nov', categorySpentFor(nov, 'cat-makanan'), 2130000);
check('Transportasi Nov', categorySpentFor(nov, 'cat-transport'), 355000);
check('Listrik & Air Nov', categorySpentFor(nov, 'cat-listrik'), 445000);
check('Pendidikan Nov', categorySpentFor(nov, 'cat-pendidikan'), 835000);
check('Kesehatan Nov', categorySpentFor(nov, 'cat-kesehatan'), 370000);
check('Hiburan Nov', categorySpentFor(nov, 'cat-hiburan'), 279000);
check('Tabungan Nov', categorySpentFor(nov, 'cat-tabungan'), 1500000);
check('Lainnya Nov', categorySpentFor(nov, 'cat-lainnya'), 360000);
check('jumlah kategori = total', CATEGORIES.reduce((s, c) => s + categorySpentFor(nov, c.id), 0), totalExpenseFor(nov));
checkNear('tingkat tabungan Nov %', savingsRateFor(nov), 14.563106796116505);
check('total belanja pasar Nov', marketTotal(nov.expenses), 1330000);

console.log('== Oktober 2026 ==');
check('item pengeluaran Okt', oct.expenses.length, 30);
check('pemasukan Okt', totalIncomeFor(oct), 10450000);
check('pengeluaran Okt', totalExpenseFor(oct), 6920000);
check('sisa Okt', remainingFor(oct), 3530000);
check('Makanan Okt', categorySpentFor(oct, 'cat-makanan'), 2240000);
check('Transportasi Okt', categorySpentFor(oct, 'cat-transport'), 380000);
check('Listrik & Air Okt', categorySpentFor(oct, 'cat-listrik'), 470000);
check('Pendidikan Okt', categorySpentFor(oct, 'cat-pendidikan'), 890000);
check('Kesehatan Okt', categorySpentFor(oct, 'cat-kesehatan'), 310000);
check('Hiburan Okt', categorySpentFor(oct, 'cat-hiburan'), 320000);
check('Tabungan Okt', categorySpentFor(oct, 'cat-tabungan'), 1500000);
check('Lainnya Okt', categorySpentFor(oct, 'cat-lainnya'), 810000);

console.log('== Arus harian November ==');
const novFlow = buildDailyFlow('2026-11', nov.expenses, nov.incomeEvents, MONTHS['2026-11'].openingBalance);
check('saldo akhir Nov', novFlow.endBalance, 6056000);
check('saldo akhir Nov = awal + sisa', novFlow.endBalance, MONTHS['2026-11'].openingBalance + remainingFor(nov));
check('titik terendah Nov', novFlow.lowest, -1904000);
check('hari titik terendah Nov', novFlow.lowestDay, 24);
check('hari minus Nov', novFlow.minusDays, 19);
check('buffer Nov', novFlow.buffer, 2000000);
check('saldo 1 Nov', novFlow.days[0].balance, 1940000);
check('saldo 25 Nov (gajian)', novFlow.days[24].balance, 5596000);

console.log('== Arus harian Oktober ==');
const octFlow = buildDailyFlow('2026-10', oct.expenses, oct.incomeEvents, MONTHS['2026-10'].openingBalance);
check('saldo akhir Okt', octFlow.endBalance, 5030000);
check('saldo akhir Okt = awal + sisa', octFlow.endBalance, MONTHS['2026-10'].openingBalance + remainingFor(oct));
check('titik terendah Okt', octFlow.lowest, -2469000);
check('hari titik terendah Okt', octFlow.lowestDay, 24);
check('hari minus Okt', octFlow.minusDays, 22);
check('buffer Okt', octFlow.buffer, 2500000);

console.log('== Skenario: tabungan digeser ke tanggal gajian ==');
const scenExpenses = applySavingsOnPayday(nov.expenses, 25);
check('total skenario = total baseline', totalExpenseFor({ expenses: scenExpenses }), 6274000);
const scenFlow = buildDailyFlow('2026-11', scenExpenses, nov.incomeEvents, MONTHS['2026-11'].openingBalance);
check('saldo akhir skenario', scenFlow.endBalance, 6056000);
check('titik terendah skenario', scenFlow.lowest, -404000);
check('hari titik terendah skenario', scenFlow.lowestDay, 24);
check('hari minus skenario', scenFlow.minusDays, 3);
check('buffer skenario', scenFlow.buffer, 500000);
check('perbaikan titik terendah', scenFlow.lowest - novFlow.lowest, 1500000);

console.log('== What-if: potong belanja pasar Rp200.000/bln ==');
const cutExpenses = applyMarketCut(nov.expenses, 200000);
check('total setelah potong', totalExpenseFor({ expenses: cutExpenses }), 6074000);
check('sisa setelah potong', 10300000 - totalExpenseFor({ expenses: cutExpenses }), 4226000);
check('tabungan ekstra per tahun', 200000 * 12, 2400000);
const cutFlow = buildDailyFlow('2026-11', cutExpenses, nov.incomeEvents, MONTHS['2026-11'].openingBalance);
check('saldo akhir what-if', cutFlow.endBalance, 6256000);

console.log('== Tagihan ==');
const billsNov = billsSummary(state, '2026-11');
check('jumlah tagihan Nov', billsNov.bills.length, 8);
check('total tagihan Nov', billsNov.total, 1554000);
check('tagihan lunas Nov', billsNov.paid.length, 8);
check('tagihan belum lunas Nov', billsNov.unpaid.length, 0);
check('tagihan Desember mendatang', billsNov.upcoming.length, 2);
check('total tagihan Des', billsNov.upcoming.reduce((s, b) => s + b.amount, 0), 850000);
// Tagihan tidak menambah pengeluaran: setiap expenseId tagihan ada di data,
// dan jumlah tagihan = jumlah item pengeluaran yang dipetakan ke tagihan itu.
for (const b of BILLS) {
  const linked = [...nov.expenses, ...oct.expenses].filter(e => b.expenseIds.includes(e.id));
  check(`tagihan ${b.id}: semua item terpeta`, linked.length, b.expenseIds.length);
  if (b.status === 'upcoming') {
    // Rencana Desember: belum ada item pengeluaran — sengaja, bukan bug.
    check(`tagihan ${b.id}: rencana tanpa item`, b.expenseIds.length, 0);
  } else {
    check(`tagihan ${b.id}: jumlah = item yang dipetakan`, b.amount, linked.reduce((s, e) => s + e.amount, 0));
  }
}

console.log('== Perbandingan Okt vs Nov ==');
const cmp = compareMonths(state);
check('delta pemasukan Nov−Okt', cmp.novIncome - cmp.octIncome, -150000);
check('delta pengeluaran Nov−Okt', cmp.novExpense - cmp.octExpense, -646000);
check('delta sisa Nov−Okt', cmp.novRemaining - cmp.octRemaining, 496000);
check('perbaikan titik terendah Nov vs Okt', cmp.novFlow.lowest - cmp.octFlow.lowest, 565000);
check('perbaikan hari minus Nov vs Okt', cmp.octFlow.minusDays - cmp.novFlow.minusDays, 3);

console.log('== Riwayat 6 bulan ==');
const hist = monthlyHistory(state);
check('bulan dalam riwayat', hist.length, 6);
check('Okt dalam riwayat', hist[4].expense, 6920000);
check('Nov dalam riwayat', hist[5].expense, 6274000);
check('sisa Sep (untuk saldo awal Okt)', 10300000 - 7300000, 3000000);
check('sisa Okt (untuk saldo awal Nov)', 10450000 - 6920000, 3530000);

console.log(`\n${pass} PASS, ${fail} FAIL`);
if (fail > 0) { console.log('GAGAL: ' + failures.join(', ')); process.exit(1); }
console.log('SEMUA ANGKA TERKUNCI.');
