[![make.fun · best-household-budget-site-20261126-1457](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/AfrizalSek/best-household-budget-site-20261126-1457/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/AfrizalSek/best-household-budget-site-20261126-1457/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)

# AnggaranKita — Situs Anggaran Rumah Tangga

Situs anggaran rumah tangga statis untuk keluarga Indonesia: perencana anggaran
bulanan, pelacak pengeluaran, tujuan tabungan, grafik pemasukan vs pengeluaran,
dan kalkulator (dana darurat, cicilan, dan 50/30/20). Semua berjalan offline
dari berkasnya sendiri, di desktop maupun di ponsel, tanpa permintaan jaringan.

Entri untuk kompetisi make.fun
[best-household-budget-site-20261126-1457](https://make.fun/c/best-household-budget-site-20261126-1457)
($50, 10 tempat).

## Menjalankan

```sh
node serve.ts
```

Lalu buka http://localhost:8080. Tidak ada build step.

## Struktur

- `app/` — situs statis: `index.html`, `style.css`, `data.js` (data awal),
  `state.js` (state + penyimpanan lokal), `charts.js` (grafik SVG),
  `views.js` (halaman-halaman), `main.js` (router hash).
- `screenshots/` — 4 tangkapan layar nyata situs yang sedang berjalan.
- `main.ts` — program penyerahan (Node 22): menyalin `app/` dan `screenshots/`
  ke `/output` dan menulis `/output/dossier.json` dengan `buildDossier`.
- `vendor/makefun-frontend.ts` — salinan pustaka make.fun dari kit, tanpa diubah.

## Lisensi

MIT — lihat `LICENSE`.
