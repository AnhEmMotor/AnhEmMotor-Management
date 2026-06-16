import { readFileSync } from 'node:fs'
import { strict as assert } from 'node:assert'

const source = readFileSync('src/views/contract/supplier/index.vue', 'utf8')

assert.match(
  source,
  /supplier-filter-card supplier-filter-card--compact/,
  'supplier filter card should opt into the compact filter layout',
)

assert.match(
  source,
  /label-position="top"/,
  'supplier filters should use top labels so labels do not squeeze the input width',
)

assert.match(
  source,
  /placeholder: 'Nhập tên nhà cung cấp'/,
  'supplier name filter should have a clear placeholder',
)

assert.match(
  source,
  /placeholder: 'Nhập số hợp đồng'/,
  'contract number filter should have a clear placeholder',
)

assert.match(
  source,
  /\.supplier-filter-card--compact :deep\(\.el-col:not\(\.action-column\)\)/,
  'compact supplier filters should constrain only field columns',
)

assert.match(
  source,
  /\.supplier-filter-card--compact :deep\(\.action-column\)/,
  'compact supplier filters should style the action column separately',
)
