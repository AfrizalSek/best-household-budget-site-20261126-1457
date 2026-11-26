// data.js — Data awal AnggaranKita (Keluarga Prasetyo, Tuban, November 2026)
// Semua angka realistis dan saling konsisten. Satu-satunya sumber data awal;
// setelah dimuat, state.js yang mengelola perubahan dan penyimpanan.

export const FAMILY = {
  name: 'Keluarga Prasetyo',
  city: 'Tuban, Jawa Timur',
  members: 'Budi (ayah), Sari (ibu), 2 anak',
  month: 'November 2026',
  monthKey: '2026-11'
};

export const INITIAL_INCOME = [
  { id: 'inc-gaji', source: 'Gaji Budi (ayah)', amount: 7500000 },
  { id: 'inc-warung', source: 'Usaha warung Sari (ibu)', amount: 2800000 }
];

export const INITIAL_CATEGORIES = [
  { id: 'cat-makanan', name: 'Makanan', budget: 2800000 },
  { id: 'cat-transport', name: 'Transportasi', budget: 900000 },
  { id: 'cat-listrik', name: 'Listrik & Air', budget: 650000 },
  { id: 'cat-pendidikan', name: 'Pendidikan', budget: 1200000 },
  { id: 'cat-kesehatan', name: 'Kesehatan', budget: 500000 },
  { id: 'cat-hiburan', name: 'Hiburan', budget: 400000 },
  { id: 'cat-tabungan', name: 'Tabungan', budget: 1500000 },
  { id: 'cat-lainnya', name: 'Lainnya', budget: 600000 }
];

export const INITIAL_EXPENSES = [
  { id: 'exp-01', date: '2026-11-01', categoryId: 'cat-pendidikan', note: 'SPP anak bulan November', amount: 650000 },
  { id: 'exp-02', date: '2026-11-02', categoryId: 'cat-makanan', note: 'Belanja mingguan Pasar Tuban', amount: 425000 },
  { id: 'exp-03', date: '2026-11-02', categoryId: 'cat-tabungan', note: 'Setor dana darurat', amount: 1000000 },
  { id: 'exp-04', date: '2026-11-03', categoryId: 'cat-transport', note: 'Bensin Pertalite motor', amount: 50000 },
  { id: 'exp-05', date: '2026-11-05', categoryId: 'cat-listrik', note: 'Token listrik 200 ribu', amount: 200000 },
  { id: 'exp-06', date: '2026-11-05', categoryId: 'cat-tabungan', note: 'Setor renovasi dapur', amount: 500000 },
  { id: 'exp-07', date: '2026-11-08', categoryId: 'cat-pendidikan', note: 'Buku dan alat tulis anak', amount: 185000 },
  { id: 'exp-08', date: '2026-11-09', categoryId: 'cat-makanan', note: 'Belanja mingguan Pasar Tuban', amount: 380000 },
  { id: 'exp-09', date: '2026-11-10', categoryId: 'cat-transport', note: 'Bensin Pertalite motor', amount: 50000 },
  { id: 'exp-10', date: '2026-11-11', categoryId: 'cat-listrik', note: 'Tagihan air PDAM', amount: 95000 },
  { id: 'exp-11', date: '2026-11-12', categoryId: 'cat-lainnya', note: 'Pulsa dan paket data', amount: 150000 },
  { id: 'exp-12', date: '2026-11-13', categoryId: 'cat-kesehatan', note: 'Obat dan vitamin di apotek', amount: 120000 },
  { id: 'exp-13', date: '2026-11-16', categoryId: 'cat-makanan', note: 'Belanja mingguan Pasar Tuban', amount: 410000 },
  { id: 'exp-14', date: '2026-11-17', categoryId: 'cat-transport', note: 'Bensin Pertalite motor', amount: 55000 },
  { id: 'exp-15', date: '2026-11-18', categoryId: 'cat-listrik', note: 'Token listrik 150 ribu', amount: 150000 },
  { id: 'exp-16', date: '2026-11-19', categoryId: 'cat-lainnya', note: 'Sabun dan keperluan rumah', amount: 210000 },
  { id: 'exp-17', date: '2026-11-20', categoryId: 'cat-transport', note: 'Servis ringan motor', amount: 150000 },
  { id: 'exp-18', date: '2026-11-21', categoryId: 'cat-makanan', note: 'Belanja bulanan beras dan minyak', amount: 520000 },
  { id: 'exp-19', date: '2026-11-22', categoryId: 'cat-hiburan', note: 'Langganan streaming keluarga', amount: 59000 },
  { id: 'exp-20', date: '2026-11-23', categoryId: 'cat-makanan', note: 'Belanja mingguan Pasar Tuban', amount: 395000 },
  { id: 'exp-21', date: '2026-11-24', categoryId: 'cat-transport', note: 'Bensin Pertalite motor', amount: 50000 },
  { id: 'exp-22', date: '2026-11-15', categoryId: 'cat-hiburan', note: 'Nonton dan jajan keluarga', amount: 220000 },
  { id: 'exp-23', date: '2026-11-26', categoryId: 'cat-kesehatan', note: 'Periksa gigi anak', amount: 250000 }
];

// Riwayat Juni–Oktober 2026 (angka final). November dihitung langsung dari
// state saat ini supaya selalu konsisten dengan pengeluaran yang tampil.
export const HISTORY = [
  { label: 'Jun 2026', income: 10100000, expense: 6850000 },
  { label: 'Jul 2026', income: 10300000, expense: 7120000 },
  { label: 'Agu 2026', income: 10150000, expense: 6480000 },
  { label: 'Sep 2026', income: 10300000, expense: 7300000 },
  { label: 'Okt 2026', income: 10450000, expense: 6920000 }
];

export const INITIAL_GOALS = [
  { id: 'goal-darurat', name: 'Dana darurat', target: 12000000, saved: 7250000, monthly: 1000000 },
  { id: 'goal-dapur', name: 'Renovasi dapur', target: 8500000, saved: 3400000, monthly: 500000 },
  { id: 'goal-liburan', name: 'Liburan keluarga', target: 4000000, saved: 1850000, monthly: 300000 }
];
