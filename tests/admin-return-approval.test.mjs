import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const returnPageSource = readFileSync(
  resolve(projectRoot, 'src/modules/sales/returns/index.vue'),
  'utf8'
);

assert.match(
  returnPageSource,
  /Duyệt hoàn tiền/,
  'Admin return approval must expose an explicit refund approval action'
);
assert.match(returnPageSource, /Từ chối/, 'Admin return approval must expose a rejection action');
assert.doesNotMatch(
  returnPageSource,
  /Nhập kho bán lẻ|Cách ly chờ hủy/,
  'Product disposition is an internal post-refund workflow and must not be part of return approval'
);

const inspectingActions =
  returnPageSource.match(
    /v-else-if="selectedRequest\.status === 'inspecting'"[\s\S]*?<\/div>/
  )?.[0] ?? '';

assert.match(
  inspectingActions,
  /handleReject/,
  'An inspected return must still be rejectable by Admin'
);
assert.match(
  inspectingActions,
  /@click="handleDecision"/,
  'An inspected return must be approvable for refund'
);

console.log('Admin return approval regression checks passed.');
