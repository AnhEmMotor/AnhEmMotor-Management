import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);

const exportPages = [
  {
    name: 'Tổng quan điều hành',
    path: 'src/modules/Accountant/view/reporting/dashboard.vue',
    handler: 'exportDashboardExcel',
  },
  {
    name: 'Báo cáo tài chính',
    path: 'src/modules/Accountant/view/reporting/financial.vue',
    handler: 'exportFinancialExcel',
  },
  {
    name: 'Báo cáo xưởng',
    path: 'src/modules/Accountant/view/reporting/workshop.vue',
    handler: 'exportWorkshopExcel',
  },
  {
    name: 'Báo cáo khách hàng',
    path: 'src/modules/Accountant/view/reporting/customer.vue',
    handler: 'exportCustomerExcel',
  },
  {
    name: 'Báo cáo nhân sự và hoa hồng',
    path: 'src/modules/Accountant/view/reporting/employee.vue',
    handler: 'exportEmployeeExcel',
  },
  {
    name: 'Bảng lương nhân sự',
    path: 'src/modules/Admin/view/employee/payroll/index.vue',
    handler: 'exportPayrollExcel',
  },
  {
    name: 'Báo cáo hợp đồng',
    path: 'src/modules/Accountant/view/reporting/contract.vue',
    handler: 'exportContractExcel',
  },
  {
    name: 'Quản lý công nợ NCC',
    path: 'src/modules/Warehouse/view/inventory/debt/index.vue',
    handler: 'exportSupplierDebtExcel',
  },
  {
    name: 'Thống kê hóa đơn',
    path: 'src/modules/Accountant/view/reporting/invoice.vue',
    handler: 'exportInvoiceExcel',
  },
];

for (const page of exportPages) {
  const source = await readFile(new URL(page.path, root), 'utf8');

  assert.match(source, /@\/utils\/report-excel/, `${page.name} must use the shared Excel exporter`);
  assert.match(
    source,
    new RegExp(`(?:function|const)\\s+${page.handler}`),
    `${page.name} must define ${page.handler}`
  );
  assert.match(
    source,
    new RegExp(`@click="${page.handler}"`),
    `${page.name} must wire its Excel button to ${page.handler}`
  );
  assert.match(source, /exportReportWorkbook\s*\(\s*\{/, `${page.name} must build a real workbook`);
}

const inventorySource = await readFile(
  new URL('src/modules/Accountant/view/reporting/warehouse-report.vue', root),
  'utf8'
);
assert.match(
  inventorySource,
  /InventoryReportApi\.export\s*\(/,
  'Inventory report must keep its existing backend Excel export'
);
assert.match(
  inventorySource,
  /Bao_cao_ton_kho\.xlsx/,
  'Inventory report must keep the existing xlsx filename'
);

const utilitySource = await readFile(new URL('src/utils/report-excel.ts', root), 'utf8');
assert.match(
  utilitySource,
  /import \* as XLSX from "xlsx"/,
  'Shared exporter must generate real xlsx workbooks'
);
assert.match(
  utilitySource,
  /XLSX\.utils\.book_append_sheet/,
  'Shared exporter must support multi-sheet reports'
);
assert.match(
  utilitySource,
  /XLSX\.writeFile/,
  'Shared exporter must download the generated workbook'
);
assert.match(
  utilitySource,
  /\^\[=\+\\-@\]/,
  'Shared exporter must neutralize formula-injection cell values'
);

console.log('Reporting Excel export regression passed for 10 required modules.');
