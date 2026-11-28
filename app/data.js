// data.js — Data AnggaranKita v2 (Keluarga Prasetyo, Tuban, Okt–Nov 2026)
// Tesis v2: "gajian ke gajian" — uang dinilai dari gajian ke gajian, bukan
// sekadar total bulanan. Gaji Budi masuk tiap tanggal 25; warung Sari
// menyetor tiap Minggu. Semua angka saling konsisten dan dihitung ulang
// oleh test/verify.mjs — tidak ada total yang diketik lepas dari itemnya.

export const FAMILY = {
  name: 'Keluarga Prasetyo',
  city: 'Tuban, Jawa Timur',
  members: 'Budi (ayah), Sari (ibu), 2 anak',
  month: 'November 2026',
  monthKey: '2026-11',
  paydayDay: 25,
  thesis: 'Gajian ke gajian: gaji masuk tanggal 25, tapi dompet minus 19 hari.'
};

export const CATEGORIES = [
  { id: 'cat-makanan', name: 'Makanan', budget: 2800000 },
  { id: 'cat-transport', name: 'Transportasi', budget: 900000 },
  { id: 'cat-listrik', name: 'Listrik & Air', budget: 650000 },
  { id: 'cat-pendidikan', name: 'Pendidikan', budget: 1200000 },
  { id: 'cat-kesehatan', name: 'Kesehatan', budget: 500000 },
  { id: 'cat-hiburan', name: 'Hiburan', budget: 400000 },
  { id: 'cat-tabungan', name: 'Tabungan', budget: 1500000 },
  { id: 'cat-lainnya', name: 'Lainnya', budget: 600000 }
];

// Urutan warna tetap per kategori (dataviz: hue tetap, tidak di-cycle).
export const CATEGORY_COLORS = {
  'cat-makanan': '#2e6b34',
  'cat-transport': '#5a9e5f',
  'cat-listrik': '#8fbc8f',
  'cat-pendidikan': '#c9a227',
  'cat-kesehatan': '#d97b29',
  'cat-hiburan': '#7a9e7e',
  'cat-tabungan': '#4a7c59',
  'cat-lainnya': '#b3261e'
};

// ---------- November 2026 ----------
// Pemasukan 10.300.000 = gaji 7.500.000 (tgl 25) + warung 5 x 560.000
// (setoran tiap Minggu: 1, 8, 15, 22, 29 Nov 2026 — semuanya hari Minggu).
// Saldo awal 1 Nov 2.030.000 = sisa Okt 3.530.000 − setor tabungan Okt 1.500.000.

export const NOV_INCOME = [
  { id: 'inc-gaji-nov', source: 'Gaji Budi (ayah)', amount: 7500000, day: 25 },
  { id: 'inc-warung-nov', source: 'Usaha warung Sari (ibu)', amount: 2800000, day: null }
];

export const NOV_INCOME_EVENTS = [
  { day: 1, label: 'Setoran warung Sari', amount: 560000 },
  { day: 8, label: 'Setoran warung Sari', amount: 560000 },
  { day: 15, label: 'Setoran warung Sari', amount: 560000 },
  { day: 22, label: 'Setoran warung Sari', amount: 560000 },
  { day: 25, label: 'Gaji Budi', amount: 7500000 },
  { day: 29, label: 'Setoran warung Sari', amount: 560000 }
];

// 43 item. Jumlah per kategori IDENTIK dengan v1 (Makanan 2.130.000,
// Transportasi 355.000, Listrik & Air 445.000, Pendidikan 835.000,
// Kesehatan 370.000, Hiburan 279.000, Tabungan 1.500.000, Lainnya 360.000),
// total 6.274.000, sisa 4.026.000. Dicapai dengan memecah item v1.
export const NOV_EXPENSES = [
  { id: 'exp-n01', date: '2026-11-01', categoryId: 'cat-pendidikan', note: 'SPP anak bulan November', amount: 650000 },
  { id: 'exp-n02', date: '2026-11-02', categoryId: 'cat-makanan', note: 'Belanja Pasar Tuban — sayur & lauk pagi', amount: 150000, market: true },
  { id: 'exp-n03', date: '2026-11-02', categoryId: 'cat-makanan', note: 'Jajan anak sepulang sekolah', amount: 90000 },
  { id: 'exp-n04', date: '2026-11-02', categoryId: 'cat-tabungan', note: 'Setor dana darurat', amount: 1000000, savingsTransfer: true },
  { id: 'exp-n05', date: '2026-11-03', categoryId: 'cat-makanan', note: 'Belanja Pasar Tuban — buah & bumbu', amount: 110000, market: true },
  { id: 'exp-n06', date: '2026-11-03', categoryId: 'cat-makanan', note: 'Tempe, tahu, dan telur', amount: 75000 },
  { id: 'exp-n07', date: '2026-11-03', categoryId: 'cat-transport', note: 'Bensin Pertalite motor', amount: 50000 },
  { id: 'exp-n08', date: '2026-11-05', categoryId: 'cat-listrik', note: 'Token listrik 200 ribu', amount: 200000 },
  { id: 'exp-n09', date: '2026-11-05', categoryId: 'cat-tabungan', note: 'Setor renovasi dapur', amount: 500000, savingsTransfer: true },
  { id: 'exp-n10', date: '2026-11-08', categoryId: 'cat-pendidikan', note: 'Buku pelajaran anak', amount: 110000 },
  { id: 'exp-n11', date: '2026-11-09', categoryId: 'cat-makanan', note: 'Belanja Pasar Tuban — sayur & lauk', amount: 130000, market: true },
  { id: 'exp-n12', date: '2026-11-09', categoryId: 'cat-makanan', note: 'Beras 5 kg dan minyak', amount: 80000 },
  { id: 'exp-n13', date: '2026-11-09', categoryId: 'cat-pendidikan', note: 'Alat tulis anak', amount: 75000 },
  { id: 'exp-n14', date: '2026-11-10', categoryId: 'cat-makanan', note: 'Belanja Pasar Tuban — buah & bumbu', amount: 100000, market: true },
  { id: 'exp-n15', date: '2026-11-10', categoryId: 'cat-makanan', note: 'Jajan anak sepulang sekolah', amount: 70000 },
  { id: 'exp-n16', date: '2026-11-10', categoryId: 'cat-transport', note: 'Bensin Pertalite motor', amount: 50000 },
  { id: 'exp-n17', date: '2026-11-10', categoryId: 'cat-kesehatan', note: 'Iuran BPJS Kesehatan', amount: 150000 },
  { id: 'exp-n18', date: '2026-11-11', categoryId: 'cat-listrik', note: 'Tagihan air PDAM', amount: 95000 },
  { id: 'exp-n19', date: '2026-11-12', categoryId: 'cat-lainnya', note: 'Pulsa HP', amount: 100000 },
  { id: 'exp-n20', date: '2026-11-12', categoryId: 'cat-lainnya', note: 'Paket data internet', amount: 50000 },
  { id: 'exp-n21', date: '2026-11-13', categoryId: 'cat-kesehatan', note: 'Obat di apotek', amount: 70000 },
  { id: 'exp-n22', date: '2026-11-13', categoryId: 'cat-kesehatan', note: 'Vitamin keluarga', amount: 50000 },
  { id: 'exp-n23', date: '2026-11-15', categoryId: 'cat-hiburan', note: 'Nonton keluarga', amount: 90000 },
  { id: 'exp-n24', date: '2026-11-15', categoryId: 'cat-hiburan', note: 'Jajan di bioskop', amount: 50000 },
  { id: 'exp-n25', date: '2026-11-15', categoryId: 'cat-lainnya', note: 'Arisan RT', amount: 100000 },
  { id: 'exp-n26', date: '2026-11-16', categoryId: 'cat-makanan', note: 'Belanja Pasar Tuban — sayur & lauk', amount: 140000, market: true },
  { id: 'exp-n27', date: '2026-11-16', categoryId: 'cat-makanan', note: 'Ayam dan ikan', amount: 95000 },
  { id: 'exp-n28', date: '2026-11-16', categoryId: 'cat-hiburan', note: 'Jajan keluarga akhir pekan', amount: 80000 },
  { id: 'exp-n29', date: '2026-11-17', categoryId: 'cat-makanan', note: 'Belanja Pasar Tuban — beras & telur', amount: 175000, market: true },
  { id: 'exp-n30', date: '2026-11-17', categoryId: 'cat-transport', note: 'Bensin Pertalite motor', amount: 55000 },
  { id: 'exp-n31', date: '2026-11-18', categoryId: 'cat-listrik', note: 'Token listrik 150 ribu', amount: 150000 },
  { id: 'exp-n32', date: '2026-11-19', categoryId: 'cat-lainnya', note: 'Sabun dan keperluan rumah', amount: 110000 },
  { id: 'exp-n33', date: '2026-11-20', categoryId: 'cat-transport', note: 'Servis ringan motor', amount: 100000 },
  { id: 'exp-n34', date: '2026-11-20', categoryId: 'cat-transport', note: 'Ganti oli motor', amount: 50000 },
  { id: 'exp-n35', date: '2026-11-21', categoryId: 'cat-makanan', note: 'Beras 10 kg', amount: 180000 },
  { id: 'exp-n36', date: '2026-11-21', categoryId: 'cat-makanan', note: 'Minyak goreng & gula', amount: 120000 },
  { id: 'exp-n37', date: '2026-11-22', categoryId: 'cat-makanan', note: 'Belanja mingguan Pasar Tuban', amount: 220000, market: true },
  { id: 'exp-n38', date: '2026-11-22', categoryId: 'cat-hiburan', note: 'Langganan streaming keluarga', amount: 59000 },
  { id: 'exp-n39', date: '2026-11-23', categoryId: 'cat-makanan', note: 'Belanja Pasar Tuban — sayur & lauk', amount: 140000, market: true },
  { id: 'exp-n40', date: '2026-11-23', categoryId: 'cat-makanan', note: 'Buah dan bumbu dapur', amount: 90000 },
  { id: 'exp-n41', date: '2026-11-24', categoryId: 'cat-makanan', note: 'Belanja Pasar Tuban — lauk & sayur', amount: 165000, market: true },
  { id: 'exp-n42', date: '2026-11-24', categoryId: 'cat-transport', note: 'Bensin Pertalite motor', amount: 50000 },
  { id: 'exp-n43', date: '2026-11-26', categoryId: 'cat-kesehatan', note: 'Periksa gigi anak', amount: 100000 }
];

// ---------- Oktober 2026 ----------
// Pemasukan 10.450.000 = gaji 7.500.000 (tgl 25) + warung 2.950.000
// (4 x 700.000 tiap Minggu 4/11/18/25 Okt + 150.000 setoran 31 Okt).
// Saldo awal 1 Okt 1.500.000 = sisa Sep 3.000.000 − setor tabungan Sep 1.500.000.
// Pengeluaran 6.920.000 (Makanan 2.240.000, Transportasi 380.000,
// Listrik & Air 470.000, Pendidikan 890.000, Kesehatan 310.000,
// Hiburan 320.000, Tabungan 1.500.000, Lainnya 810.000), sisa 3.530.000.

export const OCT_INCOME = [
  { id: 'inc-gaji-oct', source: 'Gaji Budi (ayah)', amount: 7500000, day: 25 },
  { id: 'inc-warung-oct', source: 'Usaha warung Sari (ibu)', amount: 2950000, day: null }
];

export const OCT_INCOME_EVENTS = [
  { day: 4, label: 'Setoran warung Sari', amount: 700000 },
  { day: 11, label: 'Setoran warung Sari', amount: 700000 },
  { day: 18, label: 'Setoran warung Sari', amount: 700000 },
  { day: 25, label: 'Gaji Budi', amount: 7500000 },
  { day: 25, label: 'Setoran warung Sari', amount: 700000 },
  { day: 31, label: 'Setoran warung akhir bulan', amount: 150000 }
];

export const OCT_EXPENSES = [
  { id: 'exp-o01', date: '2026-10-01', categoryId: 'cat-pendidikan', note: 'SPP anak bulan Oktober', amount: 650000 },
  { id: 'exp-o02', date: '2026-10-02', categoryId: 'cat-makanan', note: 'Belanja Pasar Tuban — mingguan', amount: 420000, market: true },
  { id: 'exp-o03', date: '2026-10-02', categoryId: 'cat-tabungan', note: 'Setor dana darurat', amount: 1000000, savingsTransfer: true },
  { id: 'exp-o04', date: '2026-10-03', categoryId: 'cat-transport', note: 'Bensin Pertalite motor', amount: 50000 },
  { id: 'exp-o05', date: '2026-10-05', categoryId: 'cat-makanan', note: 'Beras 10 kg dan minyak', amount: 180000 },
  { id: 'exp-o06', date: '2026-10-05', categoryId: 'cat-tabungan', note: 'Setor renovasi dapur', amount: 500000, savingsTransfer: true },
  { id: 'exp-o07', date: '2026-10-05', categoryId: 'cat-listrik', note: 'Token listrik 200 ribu', amount: 200000 },
  { id: 'exp-o08', date: '2026-10-06', categoryId: 'cat-lainnya', note: 'Pulsa & paket data', amount: 150000 },
  { id: 'exp-o09', date: '2026-10-08', categoryId: 'cat-pendidikan', note: 'Buku dan alat tulis', amount: 140000 },
  { id: 'exp-o10', date: '2026-10-09', categoryId: 'cat-makanan', note: 'Belanja Pasar Tuban — mingguan', amount: 390000, market: true },
  { id: 'exp-o11', date: '2026-10-10', categoryId: 'cat-transport', note: 'Bensin Pertalite motor', amount: 55000 },
  { id: 'exp-o12', date: '2026-10-11', categoryId: 'cat-listrik', note: 'Tagihan air PDAM', amount: 95000 },
  { id: 'exp-o13', date: '2026-10-12', categoryId: 'cat-makanan', note: 'Buah dan bumbu dapur', amount: 150000 },
  { id: 'exp-o14', date: '2026-10-12', categoryId: 'cat-lainnya', note: 'Arisan RT', amount: 100000 },
  { id: 'exp-o15', date: '2026-10-13', categoryId: 'cat-kesehatan', note: 'Obat dan vitamin', amount: 160000 },
  { id: 'exp-o16', date: '2026-10-15', categoryId: 'cat-hiburan', note: 'Nonton keluarga', amount: 200000 },
  { id: 'exp-o17', date: '2026-10-16', categoryId: 'cat-makanan', note: 'Belanja Pasar Tuban — mingguan', amount: 410000, market: true },
  { id: 'exp-o18', date: '2026-10-17', categoryId: 'cat-transport', note: 'Servis ringan motor', amount: 125000 },
  { id: 'exp-o19', date: '2026-10-18', categoryId: 'cat-listrik', note: 'Token listrik 175 ribu', amount: 175000 },
  { id: 'exp-o20', date: '2026-10-18', categoryId: 'cat-hiburan', note: 'Langganan streaming keluarga', amount: 59000 },
  { id: 'exp-o21', date: '2026-10-19', categoryId: 'cat-makanan', note: 'Jajan anak sepulang sekolah', amount: 120000 },
  { id: 'exp-o22', date: '2026-10-19', categoryId: 'cat-lainnya', note: 'Sabun dan keperluan rumah', amount: 210000 },
  { id: 'exp-o23', date: '2026-10-20', categoryId: 'cat-pendidikan', note: 'Les tambahan anak', amount: 100000 },
  { id: 'exp-o24', date: '2026-10-23', categoryId: 'cat-makanan', note: 'Belanja Pasar Tuban — mingguan', amount: 380000, market: true },
  { id: 'exp-o25', date: '2026-10-24', categoryId: 'cat-transport', note: 'Bensin Pertalite motor', amount: 50000 },
  { id: 'exp-o26', date: '2026-10-25', categoryId: 'cat-hiburan', note: 'Jajan pasar malam', amount: 61000 },
  { id: 'exp-o27', date: '2026-10-26', categoryId: 'cat-kesehatan', note: 'Iuran BPJS Kesehatan', amount: 150000 },
  { id: 'exp-o28', date: '2026-10-27', categoryId: 'cat-lainnya', note: 'Kipas angin baru (ganti yang rusak)', amount: 350000 },
  { id: 'exp-o29', date: '2026-10-28', categoryId: 'cat-makanan', note: 'Belanja Pasar Tuban — lauk & sayur', amount: 190000, market: true },
  { id: 'exp-o30', date: '2026-10-28', categoryId: 'cat-transport', note: 'Ongkos ojek ke pasar', amount: 100000 }
];

// ---------- Tagihan ----------
// Setiap tagihan November dipetakan ke item pengeluaran di atas — tidak ada
// double-count: tagihan adalah tampilan dari pengeluaran yang sama.
// Dua tagihan Desember berlabel rencana (belum dibayar, belum masuk
// pengeluaran November). Cicilan motor sengaja TIDAK dimasukkan: tidak ada
// di data v1 dan jumlahnya tidak boleh dikarang.

export const BILLS = [
  { id: 'bill-spp', name: 'SPP anak', amount: 650000, monthKey: '2026-11', dueDay: 5, paidDate: '2026-11-01', expenseIds: ['exp-n01'], status: 'paid' },
  { id: 'bill-token1', name: 'Token listrik', amount: 200000, monthKey: '2026-11', dueDay: 10, paidDate: '2026-11-05', expenseIds: ['exp-n08'], status: 'paid' },
  { id: 'bill-bpjs', name: 'Iuran BPJS Kesehatan', amount: 150000, monthKey: '2026-11', dueDay: 10, paidDate: '2026-11-10', expenseIds: ['exp-n17'], status: 'paid' },
  { id: 'bill-pdam', name: 'Tagihan air PDAM', amount: 95000, monthKey: '2026-11', dueDay: 15, paidDate: '2026-11-11', expenseIds: ['exp-n18'], status: 'paid' },
  { id: 'bill-pulsa', name: 'Pulsa & paket data', amount: 150000, monthKey: '2026-11', dueDay: 12, paidDate: '2026-11-12', expenseIds: ['exp-n19', 'exp-n20'], status: 'paid' },
  { id: 'bill-arisan', name: 'Arisan RT', amount: 100000, monthKey: '2026-11', dueDay: 15, paidDate: '2026-11-15', expenseIds: ['exp-n25'], status: 'paid' },
  { id: 'bill-token2', name: 'Token listrik', amount: 150000, monthKey: '2026-11', dueDay: 20, paidDate: '2026-11-18', expenseIds: ['exp-n31'], status: 'paid' },
  { id: 'bill-streaming', name: 'Langganan streaming', amount: 59000, monthKey: '2026-11', dueDay: 22, paidDate: '2026-11-22', expenseIds: ['exp-n38'], status: 'paid' },
  { id: 'bill-spp-des', name: 'SPP anak (Desember)', amount: 650000, monthKey: '2026-12', dueDay: 5, paidDate: null, expenseIds: [], status: 'upcoming' },
  { id: 'bill-token-des', name: 'Token listrik (Desember)', amount: 200000, monthKey: '2026-12', dueDay: 10, paidDate: null, expenseIds: [], status: 'upcoming' }
];

// Riwayat Juni–September 2026 (angka final). Oktober + November dihitung
// langsung dari state supaya selalu konsisten dengan data yang tampil.
export const HISTORY = [
  { label: 'Jun 2026', income: 10100000, expense: 6850000 },
  { label: 'Jul 2026', income: 10300000, expense: 7120000 },
  { label: 'Agu 2026', income: 10150000, expense: 6480000 },
  { label: 'Sep 2026', income: 10300000, expense: 7300000 }
];

export const MONTHS = {
  '2026-10': {
    key: '2026-10', label: 'Oktober 2026', short: 'Okt 2026', days: 31,
    openingBalance: 1500000,
    openingNote: 'Saldo awal 1 Okt Rp1.500.000 = sisa September Rp3.000.000 setelah setor tabungan Rp1.500.000.'
  },
  '2026-11': {
    key: '2026-11', label: 'November 2026', short: 'Nov 2026', days: 30,
    openingBalance: 2030000,
    openingNote: 'Saldo awal 1 Nov Rp2.030.000 = sisa Oktober Rp3.530.000 setelah setor tabungan Rp1.500.000.'
  }
};

export const GOALS = [
  { id: 'goal-darurat', name: 'Dana darurat', target: 12000000, saved: 7250000, monthly: 1000000 },
  { id: 'goal-dapur', name: 'Renovasi dapur', target: 8500000, saved: 3400000, monthly: 500000 },
  { id: 'goal-liburan', name: 'Liburan keluarga', target: 4000000, saved: 1850000, monthly: 300000 }
];
