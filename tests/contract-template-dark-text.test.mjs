import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { compileStyle, parse } from "@vue/compiler-sfc";

test("contract template list dark text selectors target page descendants", async () => {
  const componentUrl = new URL(
    "../src/views/contract/templates/index.vue",
    import.meta.url,
  );
  const source = await readFile(componentUrl, "utf8");
  const { descriptor, errors: parseErrors } = parse(source, {
    filename: componentUrl.pathname,
  });

  assert.deepEqual(parseErrors, []);
  assert.equal(descriptor.styles.length, 1);

  const style = descriptor.styles[0];
  const { code, errors: styleErrors } = compileStyle({
    id: "contract-template-dark-text",
    filename: componentUrl.pathname,
    source: style.content,
    preprocessLang: style.lang,
    scoped: style.scoped,
  });

  assert.deepEqual(styleErrors, []);
  assert.match(
    code,
    /html\.dark\s+\.contract-templates-page[^{]*\.text-slate-900/,
    "dark text override must target slate text inside the contract template page, not only html.dark",
  );

  const bareHtmlDarkTextRules = [
    ...code.matchAll(/([^{}]+)\{([^{}]+color:\s*#f8fafc[^{}]+)\}/g),
  ]
    .map(([, selector]) => selector.trim().replace(/\s+/g, ""))
    .filter((selector) => /^html\.dark(?:,html\.dark)*$/.test(selector));

  assert.deepEqual(
    bareHtmlDarkTextRules,
    [],
    "dark text rules compiled only as html.dark do not reach card/header text",
  );
});
