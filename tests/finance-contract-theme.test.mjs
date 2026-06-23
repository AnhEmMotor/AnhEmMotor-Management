import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import { compileStyle, parse } from '@vue/compiler-sfc'

const themedManagementViews = [
  ['finance contract list page', '../src/views/contract/finance/index.vue'],
  ['sales contract list page', '../src/views/contract/sales/index.vue'],
  ['supplier contract list page', '../src/views/contract/supplier/index.vue'],
  ['contract template list page', '../src/views/contract/templates/index.vue'],
  ['contract template editor page', '../src/views/contract/templates/edit.vue'],
  [
    'report page header component',
    '../src/views/analytics-reporting/components/ReportPageHeader.vue',
  ],
  [
    'report period switcher component',
    '../src/views/analytics-reporting/components/ReportPeriodSwitcher.vue',
  ],
  [
    'report placeholder component',
    '../src/views/analytics-reporting/components/ReportPlaceholder.vue',
  ],
]

const darkPaletteDeclaration =
  /(?:^|[;\s])(?:(?:color|--el-(?:table-)?(?:header-)?text-color[\w-]*|--el-text-color[\w-]*)\s*:\s*#f8fafc|(?:background|background-color|border|border-color|--el-bg-color[\w-]*|--el-fill-color[\w-]*|--el-border-color[\w-]*)\s*:[^;]*(?:#(?:161618|111214|101114|050506|202126)|rgb\(255 255 255\s*\/\s*(?:9|10|12|14|18|24|28)%\)))/i

for (const [viewName, componentPath] of themedManagementViews) {
  test(`${viewName} only applies its dark palette in dark mode`, async () => {
    const componentUrl = new URL(componentPath, import.meta.url)
    const source = await readFile(componentUrl, 'utf8')
    const { descriptor, errors: parseErrors } = parse(source, { filename: componentUrl.pathname })

    assert.deepEqual(parseErrors, [])
    assert.equal(descriptor.styles.length, 1, 'the Vue component must keep exactly one style block')
    assert.doesNotMatch(
      descriptor.template?.content ?? '',
      /text-color=["']#f8fafc["']/,
      'KPI cards must inherit the active theme instead of forcing dark-mode text',
    )

    const style = descriptor.styles[0]
    const { code, errors: styleErrors } = compileStyle({
      id: `management-theme-${viewName.replaceAll(/\W+/g, '-')}`,
      filename: componentUrl.pathname,
      source: style.content,
      preprocessLang: style.lang,
      scoped: style.scoped,
    })

    assert.deepEqual(styleErrors, [])

    const darkPaletteRules = [...code.matchAll(/([^{}]+)\{([^{}]+)\}/g)].filter(([, , body]) =>
      darkPaletteDeclaration.test(body),
    )
    assert.ok(darkPaletteRules.length > 0, 'expected the existing dark palette to remain defined')

    for (const [, selector] of darkPaletteRules) {
      assert.match(
        selector,
        /html\.dark/,
        `dark palette selector must be gated by html.dark: ${selector.trim()}`,
      )
    }
  })
}
