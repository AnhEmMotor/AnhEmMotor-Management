import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const page = readFileSync(resolve(root, 'src/modules/Marketing/view/contact/index.vue'), 'utf8');

const categoryStyle = page.match(/const categoryStyle = \(cat: string\) => \{([\s\S]*?)\n\};/)?.[1];

assert.ok(categoryStyle, 'Contact page must define category badge styles');

for (const category of ['Technical', 'Billing', 'Speed', 'Maintenance', 'Order']) {
  assert.match(
    categoryStyle,
    new RegExp(`${category}: ['"]bg-(?!slate|gray)[^'"]+ text-white['"]`),
    `${category} must have its own non-fallback category color`
  );
}

console.log('Contact category color regression checks passed.');
