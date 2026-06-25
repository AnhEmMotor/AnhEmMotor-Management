import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("chart theme follows the management setting store instead of VueUse document theme state", async () => {
  const source = await readFile(
    new URL("../src/hooks/core/useChart.ts", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(
    source,
    /useDark\s*\(/,
    "useChart must not call useDark(), because it can mutate the html.dark class outside the app setting store",
  );
  assert.doesNotMatch(
    source,
    /import\s*\{[^}]*\buseDark\b[^}]*\}\s*from\s*['"]@vueuse\/core['"]/,
    "useChart must not import useDark from @vueuse/core",
  );
  assert.match(
    source,
    /useSettingStore/,
    "useChart should read the active theme from the Management setting store",
  );
  assert.match(
    source,
    /storeToRefs/,
    "useChart should keep the store-backed isDark value reactive",
  );
});
