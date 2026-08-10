import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const dashboardSource = readFileSync(
  resolve(projectRoot, 'src/modules/Marketing/view/dashboard/index.vue'),
  'utf8'
);

const funnelChartBlock = dashboardSource.match(
  /if \(funnelChartRef\.value\) \{[\s\S]*?(?=\n\s*if \(sourceChartRef\.value\))/
)?.[0];

assert.ok(funnelChartBlock, 'Marketing dashboard must configure the customer journey funnel');
assert.match(
  funnelChartBlock,
  /legend:\s*\{[\s\S]*?show:\s*true[\s\S]*?bottom:\s*0/,
  'Funnel legend must be visible at the bottom of the chart'
);
assert.match(
  funnelChartBlock,
  /bottom:\s*'2[0-9]%'/,
  'Funnel series must reserve bottom space so the legend does not overlap the chart'
);
assert.match(
  funnelChartBlock,
  /label:\s*\{\s*show:\s*false/,
  'Funnel labels must not be drawn over the funnel segments'
);

console.log('Marketing dashboard funnel layout regression checks passed.');
