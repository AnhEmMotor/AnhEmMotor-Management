import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const employeeReportPath =
  "../src/modules/Accountant/view/reporting/employee.vue";
const payrollPagePath = "../src/modules/Admin/view/employee/payroll/index.vue";
const payrollApiPath = "../src/api/operations/payroll.api.ts";
const contractReportPath =
  "../src/modules/Accountant/view/reporting/contract.vue";
const staffRepositoryPath =
  "../../AnhEmMotor-Backend/Infrastructure/Repositories/AnalyticsRepository.cs";
const payrollResponsePath =
  "../../AnhEmMotor-Backend/Application/ApiContracts/HR/Responses/PayrollResponse.cs";
const statisticsControllerPath =
  "../../AnhEmMotor-Backend/WebAPI/Controllers/V1/StatisticsController.cs";

const readSource = (path) =>
  readFile(new URL(path, import.meta.url), { encoding: "utf8" });

test("employee report distinguishes missing source data from real zero values", async () => {
  const [page, repository] = await Promise.all([
    readSource(employeeReportPath),
    readSource(staffRepositoryPath),
  ]);
  const staffPerformanceMethod = repository.slice(
    repository.indexOf("GetStaffPerformanceAsync"),
    repository.indexOf("private static string GetKpiStatus"),
  );

  assert.match(staffPerformanceMethod, /HasSalesData\s*=/);
  assert.match(staffPerformanceMethod, /HasKpiData\s*=/);
  assert.match(staffPerformanceMethod, /HasCommissionData\s*=/);
  assert.match(
    staffPerformanceMethod,
    /OrderStatus\.Completed/,
    "completed orders must use the canonical lowercase order status constant",
  );
  assert.doesNotMatch(
    staffPerformanceMethod,
    /o\.StatusId\s*==\s*"Completed"/,
    "the legacy uppercase status made every real completed order disappear",
  );
  assert.match(
    staffPerformanceMethod,
    /endExclusive\s*=\s*end\.Date\.AddDays\(1\)/,
    "the selected end date must include the full day",
  );
  assert.match(
    staffPerformanceMethod,
    /ActualValue/,
    "the report should use KPI actuals when order attribution has not been mapped",
  );
  assert.match(page, /sourceCoverage/);
  assert.match(page, /hasMetricData/);
  assert.match(page, /Tình trạng nguồn dữ liệu/);
  assert.match(page, /Chưa phát sinh doanh số hoặc hoa hồng trong kỳ/);
});

test("payroll presents KPI money separately and includes it in take-home pay", async () => {
  const [page, api, response] = await Promise.all([
    readSource(payrollPagePath),
    readSource(payrollApiPath),
    readSource(payrollResponsePath),
  ]);

  assert.match(api, /kpiBonus:\s*number/);
  assert.match(page, /prop:\s*"kpiBonus"/);
  assert.match(page, /Thưởng KPI/);
  assert.match(page, /stats\.totalKpiBonus/);
  assert.match(
    response,
    /BaseSalary\s*\+\s*ConfirmedCommission\s*\+\s*PaidCommission\s*\+\s*KpiBonus/,
  );
});

test("payroll total card keeps readable theme-aware text in light mode", async () => {
  const page = await readSource(payrollPagePath);
  const payrollCardStyles = page.slice(
    page.indexOf(".payroll-kpi-grid :deep(> :first-child)"),
    page.indexOf(":global(html.dark)"),
  );

  assert.doesNotMatch(
    payrollCardStyles,
    /color:\s*#fff(?:fff)?\s*!important|color:\s*#fff(?:fff)?\s*;/,
    "light-mode payroll cards must not force white text",
  );
  assert.match(payrollCardStyles, /var\(--el-text-color-primary\)/);
  assert.match(payrollCardStyles, /var\(--el-text-color-secondary\)/);
});

test("contract report filters real contract dates, maps suppliers, and localizes statuses", async () => {
  const [page, controller] = await Promise.all([
    readSource(contractReportPath),
    readSource(statisticsControllerPath),
  ]);

  assert.match(page, /@update:start-date="onStartDateChange"/);
  assert.match(page, /@update:end-date="onEndDateChange"/);
  assert.match(page, /setPeriodRange/);
  assert.match(page, /translateContractStatus/);
  assert.match(page, /Chờ phê duyệt/);
  assert.match(page, /Đang hiệu lực/);
  assert.match(controller, /\.Include\(c => c\.Supplier\)/);
  assert.match(
    controller,
    /c\.EffectiveDate\s*>=/,
    "supplier contracts should be filtered by their business effective date",
  );
});
