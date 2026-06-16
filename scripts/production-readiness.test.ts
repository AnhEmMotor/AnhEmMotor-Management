import { readFileSync } from 'node:fs'
import { strict as assert } from 'node:assert'

const read = (path: string) => readFileSync(path, 'utf8')

const templateEditor = read('src/views/contract/templates/edit.vue')
const templateMarkup = templateEditor.split('<script setup')[0]

assert.doesNotMatch(
  templateMarkup,
  /getTokenLabel\.value\(/,
  'contract template editor markup should call the auto-unwrapped getTokenLabel function directly',
)

const analyticsDashboard = read('src/views/dashboard/analytics/modules/analytics-dashboard.vue')
assert.match(
  analyticsDashboard,
  /computed<MonthlyPoint\[\]>\(\(\) => \[\]\)/,
  'analytics dashboard empty monthly data should be typed so removing mock data does not infer never[]',
)

const financialReport = read('src/views/dashboard/analytics/modules/financial-report.vue')
assert.doesNotMatch(
  financialReport,
  /\b(plRows|employeeRows)\b/,
  'financial report should not reference removed mock P&L or employee rows',
)

const expenseManagement = read('src/views/dashboard/analytics/modules/expense-management.vue')
assert.doesNotMatch(
  expenseManagement,
  /mock|Mock|EXP-|setTimeout|Date\.now|85_000_000|24_000_000|40_000_000|120_000_000/i,
  'expense management should not include mock expense rows or fake save behavior',
)

const migrationExtensions = read('../AnhEmMotor-Backend/WebAPI/Extensions/MigrationExtensions.cs')
assert.match(
  migrationExtensions,
  /RunDemoDataSeedingOnStartup/,
  'demo business seeders should be controlled by a separate RunDemoDataSeedingOnStartup flag',
)
assert.match(
  migrationExtensions,
  /if\s*\(shouldSeedDemoData\)/,
  'demo business seeders should be isolated from required system seeders',
)
