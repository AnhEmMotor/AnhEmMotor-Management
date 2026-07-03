import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const employeeReportPath =
  "../src/modules/Accountant/view/reporting/employee.vue";
const workshopAssignmentPath =
  "../src/modules/Factory/view/service/workshop/assignment/index.vue";

test("employee commission report exposes KPI cards and chart sections", async () => {
  const source = await readFile(new URL(employeeReportPath, import.meta.url), {
    encoding: "utf8",
  });

  assert.match(
    source,
    /class="[^"]*\breporting-kpi-grid\b/,
    "employee report must show top-level KPI stats",
  );
  assert.match(
    source,
    /salesCommissionChartRef/,
    "employee report must render a sales versus commission chart",
  );
  assert.match(
    source,
    /kpiStatusChartRef/,
    "employee report must render a KPI status chart",
  );
  assert.match(
    source,
    /commissionRate/,
    "employee report must calculate commission rate from API data",
  );
  assert.match(
    source,
    /Chua co du lieu|Chưa có dữ liệu/,
    "employee report must include an empty state for missing API data",
  );
});

test("workshop assignment page loads real orders and assigns technicians", async () => {
  const source = await readFile(
    new URL(workshopAssignmentPath, import.meta.url),
    {
      encoding: "utf8",
    },
  );

  assert.match(
    source,
    /RepairOrderApi\.getList/,
    "assignment page must load repair orders from the real API",
  );
  assert.match(
    source,
    /EmployeeApi\.getList/,
    "assignment page must load technicians from the real employee API",
  );
  assert.match(
    source,
    /RepairOrderApi\.assignTechnician/,
    "assignment page must submit assignments through assignTechnician",
  );
  assert.match(
    source,
    /technicianWorkloads/,
    "assignment page must summarize technician workload",
  );
  assert.match(
    source,
    /unassignedOrders/,
    "assignment page must highlight orders that need assignment",
  );
  assert.doesNotMatch(
    source,
    /Placeholder for service\/workshop\/technicians|Khu vực quản lý và phân công công việc cho nhân viên xưởng\./,
    "assignment page must replace the placeholder content",
  );
});
