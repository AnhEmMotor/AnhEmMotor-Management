import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const potentialPageSource = readFileSync(
  resolve(projectRoot, 'src/modules/Marketing/view/customer/potential/index.vue'),
  'utf8'
);

assert.match(
  potentialPageSource,
  /lead-row-content[^"\n]*min-w-0/,
  'Lead row content must be allowed to shrink at narrower effective viewports'
);
assert.match(
  potentialPageSource,
  /interest-column[^"\n]*min-w-0/,
  'Vehicle content must not push the action buttons outside the lead card'
);
assert.match(
  potentialPageSource,
  /\.action-column :deep\(\.el-button \+ \.el-button\)[\s\S]*?margin-left:\s*0/,
  'Element Plus button margins must not offset the action column'
);
assert.match(
  potentialPageSource,
  /@media \(width <= 1280px\)/,
  'Lead cards must compact at the effective viewport produced by 150% scaling'
);

console.log('Customer potential responsive regression checks passed.');
