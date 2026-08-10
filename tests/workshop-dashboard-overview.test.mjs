import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const sharedPath = resolve(projectRoot, 'src/components/business/workshop-dashboard-overview.vue');
const adminPath = resolve(
  projectRoot,
  'src/modules/Admin/view/service/workshop/dashboard/index.vue'
);
const factoryPath = resolve(
  projectRoot,
  'src/modules/Factory/view/service/workshop/dashboard/index.vue'
);

const sharedSource = readFileSync(sharedPath, 'utf8');
const adminSource = readFileSync(adminPath, 'utf8');
const factorySource = readFileSync(factoryPath, 'utf8');

for (const [name, source] of [
  ['Admin', adminSource],
  ['Factory', factorySource],
]) {
  assert.match(
    source,
    /WorkshopDashboardOverview/,
    `${name} dashboard must render the shared workshop overview`
  );
  assert.equal(
    (source.match(/<style\b/g) ?? []).length,
    1,
    `${name} dashboard must keep exactly one style block`
  );
}

assert.match(
  sharedSource,
  /ArtLineChart/,
  'Dashboard must chart the six-month service revenue trend'
);
assert.match(sharedSource, /ArtRingChart/, 'Dashboard must chart repair-order status distribution');
assert.doesNotMatch(
  sharedSource,
  /ArtBarChart/,
  'Dashboard must stay limited to two useful charts'
);
assert.match(
  sharedSource,
  /serviceRevenue:\s*\[8_420_000,[\s\S]*?18_750_000\]/,
  'Mock preview must populate a realistic six-month revenue series'
);
assert.match(sharedSource, /Tiến độ phiếu sửa chữa/, 'Dashboard must summarize repair flow');
assert.match(sharedSource, /Việc cần xử lý/, 'Dashboard must prioritize operational alerts');
assert.match(
  sharedSource,
  /Hiệu suất kỹ thuật viên/,
  'Dashboard must expose real technician performance'
);
assert.match(
  sharedSource,
  /statisticsApi\.getWorkshopDashboardOverview/,
  'Dashboard must stay connected to the real workshop overview API'
);
assert.match(
  sharedSource,
  /Xem dữ liệu mẫu/,
  'Dashboard must offer an explicit sample-data preview switch'
);
assert.match(
  sharedSource,
  /mockMode\.value[\s\S]*?applyMockData\(\)/,
  'Sample data must only be applied while the explicit preview mode is active'
);
assert.match(
  sharedSource,
  /toàn bộ số liệu bên dưới là dữ liệu mẫu/,
  'Preview mode must clearly identify mock values as sample data'
);
assert.match(
  sharedSource,
  /@media \(width <= 768px\)/,
  'Dashboard must include its mobile-first stacked layout'
);
assert.match(
  sharedSource,
  /\.overview-grid,\s*\.chart-grid,\s*\.bottom-grid\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0, 2fr\) minmax\(320px, 0\.9fr\);[\s\S]*?align-items:\s*stretch;/,
  'Dashboard rows must share one aligned column system and equal-height cards'
);
assert.doesNotMatch(sharedSource, /\bas any\b|:\s*any\b/, 'Dashboard must not add untyped data');
assert.equal(
  (sharedSource.match(/<style\b/g) ?? []).length,
  1,
  'Shared dashboard must keep exactly one style block'
);

console.log('Workshop dashboard overview regression checks passed.');
