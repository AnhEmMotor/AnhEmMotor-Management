import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const workflowPageSource = readFileSync(
  resolve(projectRoot, 'src/modules/sales-settings/returns/index.vue'),
  'utf8'
);
const processModalSource = readFileSync(
  resolve(projectRoot, 'src/modules/sales-settings/returns/components/ProcessReturnModal.vue'),
  'utf8'
);
const orderMenuSource = readFileSync(
  resolve(projectRoot, 'src/modules/Order/Menu/index.ts'),
  'utf8'
);
const salesRouteSource = readFileSync(resolve(projectRoot, 'src/router/modules/sales.ts'), 'utf8');
const warehouseMenuSource = readFileSync(
  resolve(projectRoot, 'src/modules/Warehouse/Menu/index.ts'),
  'utf8'
);
const sieveSource = readFileSync(
  resolve(projectRoot, '../AnhEmMotor-Backend/Application/Sieve/CustomSieveProcessor.cs'),
  'utf8'
);

assert.match(
  orderMenuSource,
  /path: 'returns'[^]*component: '\/sales-settings\/returns\/index'/,
  'Order return management must use the staged return workflow page'
);
assert.match(
  salesRouteSource,
  /path: 'returns'[^]*component: '\/sales-settings\/returns\/index'/,
  'Sales return approval must use the staged return workflow page'
);
assert.match(
  warehouseMenuSource,
  /path: 'returns'[^]*component: '\/sales-settings\/returns\/index'/,
  'Warehouse returns must use the staged return workflow page'
);

assert.match(workflowPageSource, /startsWith\('\/order\/'\)/);
assert.match(workflowPageSource, /startsWith\('\/warehouse\/'\)/);
assert.match(workflowPageSource, /case 'classification':\s*return \['pending'\]/);
assert.match(workflowPageSource, /case 'approval':\s*return \['inspecting', 'rejected'\]/);
assert.match(workflowPageSource, /case 'warehouse':\s*return \['completed'\]/);
assert.match(
  sieveSource,
  /Property<ReturnRequest>\(p => p\.OrderCode\)\.CanSort\(\)\.CanFilter\(\)/
);
assert.match(sieveSource, /Property<ReturnRequest>\(p => p\.Status\)\.CanSort\(\)\.CanFilter\(\)/);

assert.match(processModalSource, /Lỗi do nhà sản xuất/);
assert.match(processModalSource, /Lỗi do khách hàng/);
assert.match(processModalSource, /status: 'inspecting'/);
assert.match(processModalSource, /Duyệt — Chuyển hàng vào kho/);
assert.match(processModalSource, /Từ chối yêu cầu trả hàng/);
assert.match(
  processModalSource,
  /status: form\.decision === 'approve' \? 'completed' : 'rejected'/
);
assert.match(
  processModalSource,
  /returnAction: form\.decision === 'approve' \? 'restock' : undefined/,
  'Only Sales approval should request warehouse restocking'
);

console.log('Order → Sales → Warehouse return workflow regression checks passed.');
