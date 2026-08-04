import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync(
  new URL("../src/modules/Admin/view/employee/kpi/index.vue", import.meta.url),
  "utf8",
);
const api = readFileSync(
  new URL("../src/api/operations/kpi.api.ts", import.meta.url),
  "utf8",
);
const route = readFileSync(
  new URL("../src/router/modules/hr.ts", import.meta.url),
  "utf8",
);
const vi = readFileSync(
  new URL("../src/i18n/package/vi.ts", import.meta.url),
  "utf8",
);

test("KPI route is visible in the active HR menu", () => {
  const kpiRoute = route.match(
    /path:\s*"kpi"[\s\S]*?component:\s*"\/Admin\/view\/employee\/kpi\/index"[\s\S]*?meta:\s*\{([\s\S]*?)\n\s*\},/,
  );
  assert.ok(kpiRoute, "active KPI route must exist");
  assert.doesNotMatch(kpiRoute[1], /isHide:\s*true/);
});

test("KPI API exposes typed CRUD operations", () => {
  assert.match(api, /export interface KpiUpsertRequest/);
  assert.match(api, /request\.get<KpiResponse\[\]>/);
  assert.match(api, /request\.post<number>/);
  assert.match(api, /request\.put<number>/);
  assert.match(api, /request\.del<number>/);
  assert.doesNotMatch(api, /\bany\b/);
});

test("KPI page uses real APIs and complete management states", () => {
  assert.match(page, /EmployeeApi\.getList\(\)/);
  assert.match(page, /kpiApi\.getAll\(\)/);
  assert.match(page, /kpiApi\.create\(toRequest\(\)\)/);
  assert.match(page, /kpiApi\.update\(form\.id,\s*toRequest\(\)\)/);
  assert.match(page, /kpiApi\.delete\(row\.id\)/);
  assert.match(page, /<ElTable/);
  assert.match(page, /<ElPagination/);
  assert.match(page, /<ElDialog/);
  assert.match(page, /<ElMessageBox|ElMessageBox\.confirm/);
  assert.match(page, /kpi-empty-state/);
  assert.match(page, /loadError/);
  assert.match(page, /@media \(width <= 767px\)/);
  assert.match(page, /:global\(html\.dark\)/);
  assert.equal((page.match(/<style/g) ?? []).length, 1);
  assert.doesNotMatch(page, /\bany\b/);
});

test("KPI page strings are localized", () => {
  assert.match(page, /menus\.hr\.kpiManagement/);
  assert.match(vi, /kpiManagement:\s*\{/);
  assert.match(vi, /title:\s*"Quản lý KPI nhân viên"/);
});
