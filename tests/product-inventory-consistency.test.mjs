import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const readSource = (path) => readFile(new URL(path, root), 'utf8');

test('warehouse and order product pages share database-backed inventory statistics', async () => {
  const [apiSource, orderHook, warehouseHook, orderPage, warehousePage] = await Promise.all([
    readSource('src/api/inventory/inventory.api.ts'),
    readSource('src/modules/Order/logic/product/list/hooks/useProductTable.ts'),
    readSource('src/modules/Warehouse/logic/product/list/hooks/useProductTable.ts'),
    readSource('src/modules/Order/view/product/list/index.vue'),
    readSource('src/modules/Warehouse/view/product/list/index.vue'),
  ]);

  assert.match(apiSource, /url: '\/api\/v1\/InventoryReport'/);
  assert.doesNotMatch(apiSource, /statistics\/warehouse-report/);

  for (const hookSource of [orderHook, warehouseHook]) {
    assert.match(hookSource, /inventoryApi\.getProductSnapshot\(\)/);
    assert.match(hookSource, /Filters: 'StatusId==for-sale'/);
    assert.match(hookSource, /totalProducts - productsInStock/);
    assert.match(hookSource, /prop: 'stock_quantity'/);
    assert.match(hookSource, /productStats/);
  }

  for (const pageSource of [orderPage, warehousePage]) {
    assert.match(pageSource, /productStats\.totalProducts \?\? '—'/);
    assert.match(pageSource, /productStats\.totalStock \?\? '—'/);
    assert.match(pageSource, /productStats\.activeProductCount \?\? '—'/);
    assert.match(pageSource, /productStats\.outOfStockCount \?\? '—'/);
    assert.match(pageSource, /#stock_quantity="\{ row \}"/);
    assert.match(pageSource, /text-\[var\(--el-text-color-primary\)\]/);
    assert.doesNotMatch(pageSource, /:count="1250"/);
    assert.doesNotMatch(pageSource, /pagination\.total - 2/);
  }
});
