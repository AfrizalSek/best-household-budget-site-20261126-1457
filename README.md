[![make.fun · best-household-budget-site-20261126-1457](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/AfrizalSek/best-household-budget-site-20261126-1457/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/AfrizalSek/best-household-budget-site-20261126-1457/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)

# AnggaranKita v2 — Gajian ke Gajian

Situs anggaran rumah tangga untuk keluarga Indonesia dengan tesis yang berbeda
dari kebanyakan perencana anggaran: **uang dinilai dari gajian ke gajian, bukan
dari total bulanan**. Gaji Budi masuk tanggal 25, warung Sari menyetor tiap
Minggu — tapi belanja jalan terus dari tanggal 1. Di November 2026, saldo
Keluarga Prasetyo (Tuban) terendah **−Rp1.904.000 pada 24 November**, sehari
sebelum gajian, dan minus selama **19 hari**. Situs ini menunjukkan arus itu
hari demi hari — dan apa yang terjadi kalau setor tabungan digeser ke tanggal
gajian (titik terendah naik Rp1.500.000, hari minus 19 → 3).

Entri untuk kompetisi make.fun
[best-household-budget-site-20261126-1457](https://make.fun/c/best-household-budget-site-20261126-1457)
($50, 10 tempat). Referral: `s9c6zfye`.

## Yang ada di dalam

- **Beranda** — tesis di atas fold, 4 kartu angka (sisa, titik terendah, hari
  minus, buffer), grafik saldo harian, donat kategori dengan legenda persen,
  tagihan berikutnya, transaksi terbaru, dan tujuan tabungan.
- **Arus Harian** — kalender saldo 30 hari (klik tanggal untuk melihat
  transaksinya), grafik garis dengan label titik terendah dan gajian, plus dua
  alat interaktif: skenario "setor tabungan saat gajian" dan slider what-if
  "kurangi belanja pasar RpX/bln → tabungan/tahun".
- **Tagihan** — 8 tagihan November dengan jatuh tempo dan tombol tandai lunas,
  plus 2 tagihan Desember mendatang. Setiap tagihan dipetakan ke item
  pengeluaran yang sama — tidak ada double-count.
- **Anggaran** — per kategori dengan batas, progres, dan status; tambah/hapus
  kategori.
- **Pengeluaran** — 43 transaksi November (30 transaksi Oktober), tambah/hapus.
- **Tabungan** — 3 tujuan dengan progres dan perkiraan selesai.
- **Kalkulator** — 50/30/20, dana darurat, dan cicilan (batas aman 30%).
- **Laporan** — November vs Oktober dengan narasi tertulis "apa yang berubah
  dan kenapa", dihitung dari data yang sama dengan halaman lain.
- **Panduan** — cara mengelola uang gajian ke gajian untuk keluarga Indonesia.

Semua angka dihitung dari data mentah yang sama di setiap halaman
(pemasukan − pengeluaran = sisa) dan dikunci oleh `test/verify.mjs`
(88 checks). Data tersimpan di `localStorage` peramban dan bisa diubah;
tombol di footer mengembalikan data contoh awal.

## Data contoh — Keluarga Prasetyo, Tuban

- Pemasukan November Rp10.300.000 (gaji Rp7.500.000 tgl 25 + warung
  5 × Rp560.000 tiap Minggu). Pengeluaran Rp6.274.000, sisa Rp4.026.000.
- Disisihkan ke tabungan Rp1.500.000 (14,6% dari pemasukan).
- Oktober 2026 ikut disertakan untuk perbandingan (pemasukan Rp10.450.000,
  pengeluaran Rp6.920.000, sisa Rp3.530.000).

## Menjalankan

```sh
node serve.ts
# buka http://localhost:8080
```

Situs statis murni (HTML + CSS + modul ES, font serif Liberation subset woff2
lokal, grafik SVG tanpa library), tanpa permintaan jaringan. Verifikasi angka:

```sh
node test/verify.mjs
```
