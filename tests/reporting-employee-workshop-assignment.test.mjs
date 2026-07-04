import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const employeeReportPath =
  "../src/modules/Accountant/view/reporting/employee.vue";
const workshopAssignmentPath =
  "../src/modules/Factory/view/service/workshop/assignment/index.vue";
const workshopRepairFormPath =
  "../src/modules/Factory/view/service/workshop/repair-orders/repair-order-form.vue";
const workshopRepairDetailPath =
  "../src/modules/Factory/view/service/workshop/repair-orders/repair-order-detail.vue";
const workshopHistoryPath =
  "../src/modules/Factory/view/service/workshop/history/index.vue";
const warrantyRequestsPath =
  "../src/modules/Factory/view/service/warranty-and-complaints/warranty-requests/index.vue";
const warrantyClaimDetailPath =
  "../src/modules/Factory/view/service/warranty-and-complaints/warranty-claim-detail/index.vue";
const factoryMenuPath = "../src/modules/Factory/Menu/index.ts";
const workspacePath = "../src/view/workspace.vue";

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

test("workshop navigation uses canonical factory workspace routes", async () => {
  const [
    formSource,
    detailSource,
    historySource,
    factoryMenuSource,
    workspaceSource,
  ] = await Promise.all([
    readFile(new URL(workshopRepairFormPath, import.meta.url), {
      encoding: "utf8",
    }),
    readFile(new URL(workshopRepairDetailPath, import.meta.url), {
      encoding: "utf8",
    }),
    readFile(new URL(workshopHistoryPath, import.meta.url), {
      encoding: "utf8",
    }),
    readFile(new URL(factoryMenuPath, import.meta.url), {
      encoding: "utf8",
    }),
    readFile(new URL(workspacePath, import.meta.url), {
      encoding: "utf8",
    }),
  ]);

  assert.match(
    workspaceSource,
    /path:\s*"\/factory\/workshop\/dashboard"/,
    "workspace card must enter the canonical Factory workshop dashboard",
  );
  assert.match(
    factoryMenuSource,
    /path:\s*"repair"[\s\S]*name:\s*"WorkshopRepair"/,
    "Factory menu must expose the canonical repair-order route",
  );
  assert.match(
    formSource,
    /router\.push\("\/factory\/workshop\/repair"\)/,
    "repair order form must return to the canonical Factory repair route",
  );
  assert.match(
    detailSource,
    /router\.push\("\/factory\/workshop\/repair"\)/,
    "repair order detail must return to the canonical Factory repair route",
  );
  assert.match(
    historySource,
    /name:\s*"WorkshopRepair"/,
    "vehicle history quick action must target the canonical Factory repair route",
  );

  for (const source of [formSource, detailSource, historySource]) {
    assert.doesNotMatch(
      source,
      /\/factory\/service\/workshop\/repair-orders|ServiceWorkshopRepairOrders/,
      "workshop screens must not navigate back to the retired service workshop route",
    );
  }
});

test("workshop warranty menu opens the warranty request page", async () => {
  const [factoryMenuSource, warrantyRequestsSource, warrantyDetailSource] =
    await Promise.all([
      readFile(new URL(factoryMenuPath, import.meta.url), {
        encoding: "utf8",
      }),
      readFile(new URL(warrantyRequestsPath, import.meta.url), {
        encoding: "utf8",
      }),
      readFile(new URL(warrantyClaimDetailPath, import.meta.url), {
        encoding: "utf8",
      }),
    ]);

  assert.match(
    factoryMenuSource,
    /path:\s*"warranty"[\s\S]*name:\s*"WorkshopWarranty"[\s\S]*\/Factory\/view\/service\/warranty-and-complaints\/warranty-requests\/index/,
    "Factory warranty menu must open the warranty request page",
  );
  assert.match(
    factoryMenuSource,
    /path:\s*"warranty\/:id"[\s\S]*name:\s*"WorkshopWarrantyClaimDetail"[\s\S]*isHide:\s*true/,
    "Factory warranty detail route must exist as a hidden child route",
  );
  assert.doesNotMatch(
    factoryMenuSource,
    /WorkshopWarranty[\s\S]*\/Factory\/view\/service\/warranty-and-complaints\/complaints\/index/,
    "Factory warranty menu must not point to the placeholder complaints page",
  );

  assert.match(
    warrantyRequestsSource,
    /name:\s*"WorkshopWarrantyClaimDetail"/,
    "warranty request rows must open the Factory warranty detail route",
  );
  assert.match(
    warrantyDetailSource,
    /name:\s*"WorkshopWarranty"/,
    "warranty detail back button must return to the Factory warranty list route",
  );

  for (const source of [warrantyRequestsSource, warrantyDetailSource]) {
    assert.doesNotMatch(
      source,
      /ServiceWarrantyClaimDetail|ServiceWarrantyRequests|#WAR-2026-001|Mock|mock/,
      "workshop warranty pages must not use retired Service routes or fake warranty data",
    );
  }
});
