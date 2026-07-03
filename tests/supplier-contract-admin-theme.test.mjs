import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { compileStyle, parse } from "@vue/compiler-sfc";

const componentPath = "../src/modules/Admin/view/contract/supplier/index.vue";

const darkPaletteDeclaration =
  /(?:^|[;\s])(?:(?:color|--el-(?:table-)?(?:header-)?text-color[\w-]*|--el-text-color[\w-]*)\s*:\s*#f8fafc|(?:background|background-color|border|border-color|--el-bg-color[\w-]*|--el-fill-color[\w-]*|--el-border-color[\w-]*)\s*:[^;]*(?:#(?:161618|111214|101114|050506|202126)|rgb\(255 255 255\s*\/\s*(?:9|10|12|14|18|24|28)%\)))/i;

test("admin supplier contract page gates dark palette behind html.dark", async () => {
  const componentUrl = new URL(componentPath, import.meta.url);
  const source = await readFile(componentUrl, "utf8");
  const { descriptor, errors: parseErrors } = parse(source, {
    filename: componentUrl.pathname,
  });

  assert.deepEqual(parseErrors, []);
  assert.equal(
    descriptor.styles.length,
    1,
    "the Vue component must keep exactly one style block",
  );

  const style = descriptor.styles[0];
  const { code, errors: styleErrors } = compileStyle({
    id: "admin-supplier-contract-theme",
    filename: componentUrl.pathname,
    source: style.content,
    preprocessLang: style.lang,
    scoped: style.scoped,
  });

  assert.deepEqual(styleErrors, []);

  const darkPaletteRules = [...code.matchAll(/([^{}]+)\{([^{}]+)\}/g)].filter(
    ([, , body]) => darkPaletteDeclaration.test(body),
  );

  assert.ok(
    darkPaletteRules.length > 0,
    "expected the dark palette to remain defined for dark mode",
  );

  for (const [, selector] of darkPaletteRules) {
    assert.match(
      selector,
      /html\.dark/,
      `dark palette selector must be gated by html.dark: ${selector.trim()}`,
    );
  }
});
