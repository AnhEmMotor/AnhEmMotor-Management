import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const readSource = (relativePath) => readFile(new URL(relativePath, import.meta.url), 'utf8');

test('invoice total stays readable in dark mode', async () => {
  const source = await readSource('../src/modules/Order/view/product/invoice/index.vue');

  assert.match(source, /font-bold text-gray-800 dark:text-gray-100/);
});

test('all ECharts instances receive theme-safe text and surface colors', async () => {
  const [mainSource, themeSource] = await Promise.all([
    readSource('../src/main.ts'),
    readSource('../src/common/utils/ui/echarts-theme.ts'),
  ]);

  assert.match(mainSource, /installEChartsThemeSync\(\)/);
  assert.match(themeSource, /MutationObserver/);
  assert.doesNotMatch(themeSource, /import \* as echarts/);
  assert.match(themeSource, /await import\('echarts'\)/);
  assert.match(themeSource, /querySelectorAll<HTMLElement>/);
  assert.match(themeSource, /currentOptions\[axisName\]/);
  assert.match(themeSource, /themedOptions\.legend/);
  assert.match(themeSource, /themedOptions\.tooltip/);
});
