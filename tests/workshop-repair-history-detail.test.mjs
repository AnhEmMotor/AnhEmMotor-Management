import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);

const readSource = (path) => readFile(new URL(path, root), 'utf8');

test('Admin and Factory repair history routes use the shared detail experience', async () => {
  const [admin, factory] = await Promise.all([
    readSource('src/modules/Admin/view/service/workshop/repair-history/repair-order-detail.vue'),
    readSource('src/modules/Factory/view/service/workshop/repair-history/repair-order-detail.vue'),
  ]);

  assert.match(admin, /WorkshopRepairHistoryDetail/);
  assert.match(admin, /back-path="\/admin\/service\/repair-history"/);
  assert.match(factory, /WorkshopRepairHistoryDetail/);
  assert.match(factory, /back-path="\/factory\/workshop\/repair-history"/);
});

test('repair history detail is data-driven, responsive, and theme-safe', async () => {
  const source = await readSource('src/components/business/workshop-repair-history-detail.vue');

  assert.match(source, /RepairOrderApi\.getDetail\(props\.orderId\)/);
  assert.match(source, /order\.maintenanceDate/);
  assert.match(source, /order\.technicianName/);
  assert.match(source, /order\.partsCost/);
  assert.match(source, /order\.laborCost/);
  assert.match(source, /order\.totalCost/);
  assert.match(source, /order\.nextMaintenanceDate/);
  assert.match(source, /order\.nextMaintenanceOdo/);
  assert.match(source, /v-if="loading"/);
  assert.match(source, /v-else-if="loadError"/);
  assert.match(source, /v-else-if="order"/);
  assert.match(source, /@media \(width <= 640px\)/);
  assert.match(source, /var\(--el-bg-color-page\)/);
  assert.match(source, /--report-red: #e84a4a/);
  assert.equal((source.match(/<style\b/g) || []).length, 1);
  assert.doesNotMatch(source, /\bany\b/);
  assert.doesNotMatch(source, /mock|demo|giả định/i);
});
