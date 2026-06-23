import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import { compileStyle, parse } from '@vue/compiler-sfc'

test('contact management page has dark-mode scoped theme overrides', async () => {
  const componentUrl = new URL('../src/views/contact-management/index.vue', import.meta.url)
  const source = await readFile(componentUrl, 'utf8')
  const { descriptor, errors: parseErrors } = parse(source, { filename: componentUrl.pathname })

  assert.deepEqual(parseErrors, [])
  assert.equal(descriptor.styles.length, 1, 'the contact page must keep exactly one style block')
  assert.doesNotMatch(
    descriptor.template?.content ?? '',
    /bg-\[#F8FAFC\]|text-\[#0F172A\]/,
    'page-level light colors should live in CSS variables so dark mode can override them',
  )

  const style = descriptor.styles[0]
  const { code, errors: styleErrors } = compileStyle({
    id: 'contact-management-theme',
    filename: componentUrl.pathname,
    source: style.content,
    preprocessLang: style.lang,
    scoped: style.scoped,
  })

  assert.deepEqual(styleErrors, [])
  assert.match(code, /html\.dark\s+\.contact-page/, 'dark theme rules must be gated by html.dark')
  assert.match(
    code,
    /html\.dark\s+\.contact-page[^{]*\.list-panel/,
    'dark theme must reach the list panel, not only the page root',
  )
  assert.match(
    code,
    /html\.dark\s+\.contact-page[^{]*\.text-slate-800/,
    'dark theme must override slate text inside the contact page',
  )
})
