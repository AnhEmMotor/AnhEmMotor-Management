import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const payrollPagePath = "../src/modules/Admin/view/employee/payroll/index.vue";

const readPayrollPage = () =>
  readFile(new URL(payrollPagePath, import.meta.url), { encoding: "utf8" });

test("payroll page exposes a clear period header and formatted KPI hierarchy", async () => {
  const source = await readPayrollPage();

  assert.match(source, /class="payroll-hero"/);
  assert.match(source, /class="payroll-period-badge"/);
  assert.match(source, /class="[^"]*payroll-kpi-grid[^"]*"/);
  assert.match(source, /:count="formatCurrency\(stats\.totalPayroll\)"/);
  assert.match(source, /:count="formatCurrency\(stats\.totalKpiBonus\)"/);
  assert.match(source, /title="Tổng thưởng KPI"/);
  assert.match(source, /Kỳ lương và nhân sự/);
  assert.match(source, /Chi tiết bảng lương/);
});

test("payroll page keeps responsive and theme-safe presentation rules", async () => {
  const source = await readPayrollPage();

  assert.match(source, /@media \((?:max-width: 767px|width <= 767px)\)/);
  assert.match(source, /:global\(html\.dark\) \.payroll-hero/);
  assert.match(source, /var\(--el-bg-color-overlay\)/);
  assert.match(source, /font-variant-numeric: tabular-nums/);
  assert.equal(
    (source.match(/<style\b/g) || []).length,
    1,
    "payroll SFC must keep exactly one style block",
  );
});
