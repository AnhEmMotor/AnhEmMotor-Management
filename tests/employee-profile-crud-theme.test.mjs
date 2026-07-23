import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const pagePath = new URL(
  "../src/modules/Admin/view/employee/employee/index.vue",
  import.meta.url,
);
const apiPath = new URL(
  "../src/api/operations/employee.api.ts",
  import.meta.url,
);
const controllerPath = new URL(
  "../../AnhEmMotor-Backend/WebAPI/Controllers/V1/EmployeeController.cs",
  import.meta.url,
);
const updateCommandPath = new URL(
  "../../AnhEmMotor-Backend/Application/Features/HR/Commands/UpdateEmployee/UpdateEmployeeCommand.cs",
  import.meta.url,
);

const page = readFileSync(pagePath, "utf8");
const api = readFileSync(apiPath, "utf8");
const controller = readFileSync(controllerPath, "utf8");
const updateCommand = readFileSync(updateCommandPath, "utf8");

test("employee backend exposes complete read, create, update, and delete routes", () => {
  assert.match(controller, /\[HttpGet\("\{id\}"\)\]/);
  assert.match(controller, /GetEmployeeByIdAsync/);
  assert.match(controller, /\[HttpDelete\("\{id\}"\)\]/);
  assert.match(controller, /DeleteEmployeeAsync/);
});

test("employee update contract persists the editable identity fields", () => {
  assert.match(updateCommand, /string FullName/);
  assert.match(updateCommand, /string Email/);
});

test("employee API uses typed request and response contracts", () => {
  assert.match(api, /export interface EmployeeUpsertRequest/);
  assert.match(api, /create\(data: EmployeeUpsertRequest\)/);
  assert.match(api, /update\(id: number, data: EmployeeUpsertRequest\)/);
  assert.match(api, /request\.del<number>/);
  assert.doesNotMatch(api, /\bany\b/);
});

test("employee page paginates locally and uses system theme text tokens", () => {
  assert.match(page, /const paginatedEmployees = computed/);
  assert.match(page, /:data="paginatedEmployees"/);
  assert.match(page, /selectedEmployee\.value = await EmployeeApi\.getById/);
  assert.match(page, /Permissions\.Admin\.EmployeeManagement\.Create/);
  assert.match(page, /color: var\(--el-text-color-primary\)/);
  assert.match(page, /color: var\(--el-text-color-secondary\)/);
  assert.doesNotMatch(page, /stats\.inactive\s*=\s*0/);
  assert.equal((page.match(/<style\b/g) || []).length, 1);
});
