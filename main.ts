// Entri best-household-budget-site-20261126-1457 (Node 22, hanya pustaka standar).
// Situsnya ada di app/ pada repo ini: berkas statis biasa yang dibuka browser
// lewat app/index.html (modul ES, CSS, tanpa build step), dan tidak ada satu pun
// yang dijalankan, ditata, atau ditampilkan situs ini dimuat lewat jaringan.
// Program ini menyerahkan situs itu: menyalin app/ dan screenshots/ dari
// samping berkas ini ke /output, lalu menulis /output/dossier.json, ringkasan
// yang dibaca juri (tangkapan layar, berkas dan byte saat pertama dimuat, dan
// sumber situs), memakai pustaka make.fun yang sudah di-vendor.
// Biarkan vendor/makefun-frontend.ts apa adanya: scorer mengharuskan
// dossier.json sama persis byte demi byte dengan yang ditulis salinan pustaka
// miliknya sendiri.
//
// Jalankan situs secara lokal dengan `node serve.ts`, lalu buka
// http://localhost:8080. Di luar kontainer grader, MAKEFUN_OUTPUT_DIR
// menggantikan /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// Batas scorer sendiri (reference/gate.json): hanya text_max_bytes yang
// membentuk byte dossier; sisanya menolak entri yang scorer akan tolak
// (lebih dari 4 tangkapan layar atau satu di atas 256 KiB; lebih dari 993
// berkas dan direktori di app/ atau 16 MiB berkas app/: app/ dihitung di
// samping batas 1000 entri /output sendiri, berikut screenshots/ dan
// dossier.json-nya).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  }),
);
