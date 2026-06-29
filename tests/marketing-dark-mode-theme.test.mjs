import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { compileStyle, parse } from "@vue/compiler-sfc";

const pages = [
  {
    path: "../src/modules/Marketing/view/banner/index.vue",
    pageClass: "banner-management-page",
    descendants: [".bg-white", ".border-slate-200", ".text-slate-900"],
  },
  {
    path: "../src/modules/Marketing/article/list/index.vue",
    pageClass: "article-list-page",
    descendants: [".bg-white", ".border-slate-200", ".text-slate-800"],
  },
  {
    path: "../src/modules/Marketing/view/comment/index.vue",
    pageClass: "comment-page",
    descendants: [".bg-white", ".border-slate-200", ".text-slate-900"],
  },
  {
    path: "../src/modules/Marketing/view/customer/booking/index.vue",
    pageClass: "customer-booking-page",
    descendants: [".bg-white", ".border-slate-200", ".text-slate-900"],
  },
];

test("marketing pages compile dark theme selectors to real descendants", async () => {
  for (const page of pages) {
    const componentUrl = new URL(page.path, import.meta.url);
    const source = await readFile(componentUrl, "utf8");
    const { descriptor, errors: parseErrors } = parse(source, {
      filename: componentUrl.pathname,
    });

    assert.deepEqual(parseErrors, []);
    assert.equal(
      descriptor.styles.length,
      1,
      `${page.path} must keep exactly one style block`,
    );

    const style = descriptor.styles[0];
    const { code, errors: styleErrors } = compileStyle({
      id: `marketing-dark-${page.pageClass}`,
      filename: componentUrl.pathname,
      source: style.content,
      preprocessLang: style.lang,
      scoped: style.scoped,
    });

    assert.deepEqual(styleErrors, []);

    for (const descendant of page.descendants) {
      const escapedDescendant = descendant.replace(".", "\\.");
      assert.match(
        code,
        new RegExp(
          `html\\.dark\\s+\\.${page.pageClass}[^{}]*${escapedDescendant}`,
        ),
        `${page.path} dark mode must target ${descendant} inside .${page.pageClass}`,
      );
    }
  }
});
