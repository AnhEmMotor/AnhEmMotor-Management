import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const managementRoot = resolve(testDirectory, '..');
const backendRoot = resolve(managementRoot, '..', 'AnhEmMotor-Backend');

const readManagementFile = (path) => readFileSync(resolve(managementRoot, path), 'utf8');
const activeUserSource = readManagementFile('src/modules/Admin/view/dashboard/active-user.vue');
const cardListSource = readManagementFile('src/modules/Admin/view/dashboard/card-list.vue');
const salesOverviewSource = readManagementFile(
  'src/modules/Admin/view/dashboard/sales-overview.vue'
);
const todoListSource = readManagementFile('src/modules/Admin/view/dashboard/todo-list.vue');
const contactSource = readManagementFile('src/modules/Marketing/view/contact/index.vue');
const statisticalRepositorySource = readFileSync(
  resolve(backendRoot, 'Infrastructure/Repositories/Statistical/StatisticalReadRepository.cs'),
  'utf8'
);

assert.match(
  activeUserSource,
  /totalCount\s*\?\?\s*userRes\.total/,
  'The total-account card must read the current UserManager totalCount contract'
);

assert.match(
  cardListSource,
  /So với kỳ trước/,
  'KPI percentage changes must identify their comparison period'
);

assert.match(
  salesOverviewSource,
  /const MILLION_VND = 1_000_000/,
  'The revenue chart must use one explicit million-VND scale'
);
assert.match(salesOverviewSource, /Triệu VNĐ/, 'The chart axis must be labelled in million VND');
assert.match(salesOverviewSource, /triệu VNĐ/, 'The chart tooltip must be labelled in million VND');
assert.doesNotMatch(
  salesOverviewSource,
  /1e9|[Tt]ỷ VNĐ/,
  'The dashboard chart must not retain the old billion-VND conversion'
);

for (const route of [
  '/Warehouse/inventory-settings',
  '/Marketing/contact?tab=feedback',
  '/Order/management/order',
]) {
  assert.match(
    todoListSource,
    new RegExp(route.replace(/[/?]/g, '\\$&')),
    `The system-alert action must use the registered route ${route}`
  );
}
assert.match(
  todoListSource,
  /<RouterLink\s+:to="item\.actionUrl"/,
  'Alert links must use SPA routing'
);
assert.match(
  contactSource,
  /route\.query\.tab[\s\S]*\['support', 'feedback', 'candidate'\]/,
  'The contact page must open the feedback tab requested by the alert link'
);

assert.match(
  statisticalRepositorySource,
  /GetMonthlyRevenueProfitAsync[\s\S]*context\.Invoices[\s\S]*OrderStatus\.Completed/,
  'Monthly dashboard revenue must include completed showroom invoices'
);
assert.match(
  statisticalRepositorySource,
  /orderRevenueData[\s\S]*Concat\(invoiceRevenueData\)/,
  'Monthly revenue must combine order and showroom-invoice channels'
);
assert.match(
  statisticalRepositorySource,
  /KpiRange[\s\S]*TimeSpan\.FromHours\(7\)[\s\S]*return \(mon, now\)/,
  'KPI periods must use Vietnam time and compare elapsed periods instead of future dates'
);

console.log('Admin dashboard console regression checks passed.');
