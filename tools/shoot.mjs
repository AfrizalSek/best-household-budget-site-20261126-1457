// tools/shoot.mjs — CDP driver: uji interaksi AnggaranKita v2 di Chrome
// headless + ambil 4 screenshot. Node 22+ (WebSocket global, tanpa dependensi).
// Bukan bagian dari entri (tidak disalin main.ts ke /output).
// Prasyarat: `node serve.ts` di :8080 + Chrome headless di :9222.
// Jalankan: node tools/shoot.mjs
const SHOTS = '/home/hatch/workspace/best-household-budget-site/repo/screenshots';
const BASE = 'http://localhost:8080';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function newTarget() {
  const res = await fetch('http://localhost:9222/json/new?about:blank', { method: 'PUT' });
  if (!res.ok) throw new Error('new target failed: ' + res.status);
  return res.json();
}

class CDP {
  constructor(url) { this.ws = new WebSocket(url); this.id = 0; this.pending = new Map(); this.events = []; }
  async open() {
    await new Promise((res, rej) => { this.ws.onopen = res; this.ws.onerror = rej; });
    this.ws.onmessage = (m) => {
      const d = JSON.parse(m.data);
      if (d.id && this.pending.has(d.id)) { this.pending.get(d.id)(d); this.pending.delete(d.id); }
      else if (d.method) this.events.push(d);
    };
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((res) => { this.pending.set(id, res); this.ws.send(JSON.stringify({ id, method, params })); setTimeout(() => { if (this.pending.has(id)) { this.pending.delete(id); res({ timeout: true, method }); } }, 10000); });
  }
  async eval(expr) {
    const r = await this.send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
    if (r.result?.exceptionDetails) throw new Error('eval failed: ' + JSON.stringify(r.result.exceptionDetails).slice(0, 500));
    return r.result?.result?.value;
  }
  async shot(file, quality = 85) {
    const r = await this.send('Page.captureScreenshot', { format: 'jpeg', quality });
    const { writeFileSync } = await import('node:fs');
    writeFileSync(`${SHOTS}/${file}`, Buffer.from(r.result.data, 'base64'));
  }
}

const target = await newTarget();
const cdp = new CDP(target.webSocketDebuggerUrl);
await cdp.open();
await cdp.send('Page.enable');
await cdp.send('Runtime.enable');
await cdp.send('Log.enable');

async function nav(url, width, height, mobile = false) {
  await cdp.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile });
  await cdp.send('Page.navigate', { url });
  await sleep(1500);
}
const text = () => cdp.eval(`document.querySelector('#app').textContent`);
const consoleErrors = () => cdp.events.filter((e) =>
  (e.method === 'Log.entryAdded' && e.params.entry.level === 'error') ||
  (e.method === 'Runtime.exceptionThrown')).map((e) => JSON.stringify(e.params).slice(0, 300));

// --- Uji interaksi (desktop) ---
// 1. Tambah + hapus pengeluaran (43 → 44 → 43).
await nav(`${BASE}/#/pengeluaran`, 1280, 900);
const rowsBefore = await cdp.eval(`document.querySelectorAll('#app tbody tr').length`);
await cdp.eval(`(() => {
  const form = document.querySelector('form[data-form="add-expense"]');
  form.querySelector('input[type="date"]').value = '2026-11-26';
  form.querySelector('input[name="note"]').value = 'Tes browser';
  form.querySelector('select[name="categoryId"]').value = 'cat-makanan';
  form.querySelector('input[name="amount"]').value = '50000';
  form.querySelector('button[type="submit"]').click();
  return 'ok';
})()`);
await sleep(600);
const afterAdd = await cdp.eval(`document.querySelectorAll('#app tbody tr').length + '|' + ([...document.querySelectorAll('#app tbody tr')].some(tr => tr.textContent.includes('Tes browser')) ? 'FOUND' : 'MISSING')`);
await cdp.eval(`(() => {
  const row = [...document.querySelectorAll('#app tbody tr')].find(tr => tr.textContent.includes('Tes browser'));
  if (!row) return 'NO-ROW';
  row.querySelector('button')?.click();
  return 'clicked';
})()`);
await sleep(600);
const afterDel = await cdp.eval(`document.querySelectorAll('#app tbody tr').length + '|' + ([...document.querySelectorAll('#app tbody tr')].some(tr => tr.textContent.includes('Tes browser')) ? 'STILL-THERE' : 'GONE')`);

// 2. Month switcher Okt → Nov.
await nav(`${BASE}/#/`, 1280, 900);
await cdp.eval(`document.querySelector('[data-action="switch-month"][data-month="2026-10"]').click()`);
await sleep(600);
const octText = await text();
const octCheck = octText.includes('3.530.000') && octText.includes('Oktober');
await cdp.eval(`document.querySelector('[data-action="switch-month"][data-month="2026-11"]').click()`);
await sleep(600);
const novCheck = (await text()).includes('4.026.000');

// 3. Tagihan: tandai SPP belum lunas lalu kembalikan.
await nav(`${BASE}/#/tagihan`, 1280, 900);
await cdp.eval(`document.querySelector('[data-action="toggle-bill"][data-id="bill-spp"]').click()`);
await sleep(600);
const billToggle1 = (await text()).includes('Belum lunas');
await cdp.eval(`document.querySelector('[data-action="toggle-bill"][data-id="bill-spp"]').click()`);
await sleep(600);
const billToggle2 = (await text()).includes('8 dari 8 tagihan');

// 4. Arus harian: skenario + slider + klik kalender.
await nav(`${BASE}/#/arus-harian`, 1280, 900);
await cdp.eval(`document.querySelector('[data-action="toggle-scenario"]').click()`);
await sleep(600);
const scenCheck = (await text()).includes('404.000');
await cdp.eval(`(() => {
  const s = document.querySelector('[data-action="set-cut"]');
  s.value = '200000';
  s.dispatchEvent(new Event('input', { bubbles: true }));
  return 'ok';
})()`);
await sleep(600);
const cutCheck = (await text()).includes('2.400.000');
await cdp.eval(`document.querySelector('[data-action="select-day"][data-day="25"]').click()`);
await sleep(600);
const dayCheck = (await text()).includes('25 November 2026');

// 5. Kalkulator 50/30/20.
await nav(`${BASE}/#/kalkulator`, 1280, 900);
await cdp.eval(`(() => {
  const form = document.querySelector('form[data-calc="fifty"]');
  form.querySelector('input[name="income"]').value = '15000000';
  form.querySelector('button[type="submit"]').click();
  return 'ok';
})()`);
await sleep(600);
const calcCheck = (await text()).includes('7.500.000');

// --- Screenshot (state bersih dulu; reload penuh supaya ui skenario/slider
// dari uji interaksi ikut reset — navigasi hash saja tidak me-reload halaman) ---
await cdp.eval(`localStorage.clear()`);
await cdp.send('Page.reload');
await sleep(1500);
await nav(`${BASE}/#/`, 1280, 1000);
await cdp.shot('1-dashboard.jpg');
await nav(`${BASE}/#/arus-harian`, 1280, 1000);
await cdp.shot('2-arus-harian.jpg');
await nav(`${BASE}/#/tagihan`, 1280, 900);
await cdp.shot('3-tagihan.jpg');
await nav(`${BASE}/#/`, 390, 844, true);
await cdp.shot('4-phone.jpg');

const errs = consoleErrors();
console.log(JSON.stringify({ rowsBefore, afterAdd, afterDel, octCheck, novCheck, billToggle1, billToggle2, scenCheck, cutCheck, dayCheck, calcCheck, consoleErrors: errs }, null, 2));
process.exit(0);
