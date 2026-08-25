import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);

const readSource = (path) => readFile(new URL(path, root), 'utf8');

test('warranty and workshop payment surfaces use theme-aware colors', async () => {
  const [warranty, payment] = await Promise.all([
    readSource(
      'src/modules/Factory/view/service/warranty-and-complaints/warranty-requests/index.vue'
    ),
    readSource('src/modules/Factory/view/service/workshop/counter/payment-list/index.vue'),
  ]);

  assert.match(warranty, /bg-\[var\(--default-bg-color\)\]/);
  assert.match(warranty, /bg-box p-6 rounded-xl shadow-sm border-full-d/);
  assert.match(warranty, /bg-box rounded-xl shadow-sm border-full-d overflow-hidden/);
  assert.match(warranty, /header-cell-class-name="bg-g-200 text-g-800 font-semibold"/);
  assert.match(warranty, /dark:bg-emerald-950\/30/);
  assert.match(warranty, /dark:bg-rose-950\/30/);
  assert.match(warranty, /dark:bg-blue-950\/30/);

  assert.match(payment, /bg-box p-6 rounded-xl shadow-sm border-full-d/);
  assert.match(payment, /text-2xl font-bold text-g-900/);
  assert.match(payment, /bg-blue-50\/60 dark:bg-blue-950\/30/);
});
