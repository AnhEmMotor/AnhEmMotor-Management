import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(testDirectory, '..');
const dashboardSource = readFileSync(
  resolve(projectRoot, 'src/modules/Admin/view/dashboard/ecommerce/index.vue'),
  'utf8'
);
const dashboardApiSource = readFileSync(resolve(projectRoot, 'src/api/dashboard.api.ts'), 'utf8');

assert.match(
  dashboardSource,
  /fetchDailyCategoryRevenue\(getDays\(\), start, end\)/,
  'The revenue chart must use the same selected date range as the dashboard summary'
);
assert.match(
  dashboardApiSource,
  /params:\s*\{ days, start, end \}/,
  'The daily category API must forward custom start and end dates'
);
assert.doesNotMatch(
  dashboardSource,
  /245500000|Nguyễn Trường Giang|Bán Xe máy['"], revenue/,
  'The business dashboard must not fabricate fallback revenue, staff, or transaction data'
);

console.log('Ecommerce dashboard data-integrity regression checks passed.');
