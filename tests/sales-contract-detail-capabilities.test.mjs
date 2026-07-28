import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const detailPath = new URL(
  "../src/modules/Admin/view/contract/sales/contract-preview.vue",
  import.meta.url,
);
const detailSource = readFileSync(detailPath, "utf8");
const orderDetailSource = readFileSync(
  new URL(
    "../src/modules/Order/view/order/contract/contract-preview.vue",
    import.meta.url,
  ),
  "utf8",
);
const apiSource = readFileSync(
  new URL("../src/api/sales/sales-contract.api.ts", import.meta.url),
  "utf8",
);
const controllerSource = readFileSync(
  new URL(
    "../../AnhEmMotor-Backend/WebAPI/Controllers/V1/SalesContractsController.cs",
    import.meta.url,
  ),
  "utf8",
);

test("sales-contract detail keeps app chrome theme-aware and the A4 contract legally styled", () => {
  assert.equal((detailSource.match(/<style\b/g) ?? []).length, 1);
  assert.match(detailSource, /var\(--el-(?:bg|fill|text|border)-color/);
  assert.match(detailSource, /html\.dark/);
  assert.match(
    detailSource,
    /\.a4-paper[\s\S]*font-family:\s*['"]?Times New Roman/i,
  );
  assert.doesNotMatch(detailSource, /text-color=["']#f8fafc["']/i);
});

test("order contract detail is responsive and does not leak the dark palette into light mode", () => {
  assert.equal((orderDetailSource.match(/<style\b/g) ?? []).length, 1);
  assert.match(orderDetailSource, /:xs="24"[\s\S]*:md="10"/);
  assert.match(orderDetailSource, /var\(--el-(?:bg|fill|text|border)-color/);
  assert.match(orderDetailSource, /html\.dark/);
  assert.match(orderDetailSource, /@media\s+\(width <= 768px\)/);
  assert.match(orderDetailSource, /@media\s+print/);
});

test("sales-contract detail uploads image or PDF scans through the API", () => {
  assert.match(
    detailSource,
    /accept=["'][^"']*(?:image\/\*|\.png|\.jpe?g)[^"']*["']/i,
  );
  assert.match(
    detailSource,
    /accept=["'][^"']*(?:application\/pdf|\.pdf)[^"']*["']/i,
  );
  assert.match(detailSource, /SalesContractApi\.uploadScannedFile/);
  assert.match(apiSource, /new FormData\s*\(/);
  assert.match(apiSource, /\.append\(\s*['"]file['"]/);
  assert.match(apiSource, /sales\/\$\{contractId\}\/scanned-file/);
  assert.match(controllerSource, /HttpPost\("\{id:guid\}\/scanned-file"\)/);
  assert.match(controllerSource, /Consumes\("multipart\/form-data"\)/);
});

test("sales-contract detail print action invokes the browser print flow", () => {
  assert.match(detailSource, /window\.print\s*\(\s*\)/);
  assert.match(detailSource, /@media\s+print/);
  assert.match(
    detailSource,
    /@click="handlePrint"[\s\S]{0,160}v-auth="Permissions\.Admin\.ContractManagement\.View"/,
  );
});

test("sales-contract detail requires Admin approval before signed-scan upload", () => {
  assert.match(
    detailSource,
    /v-if="contractData\.status === 'PendingApproval'"[\s\S]{0,180}@click="handleApproveContract"/,
  );
  assert.match(detailSource, /@click="handleApproveContract"/);
  assert.match(detailSource, />\s*Duyệt Hợp Đồng\s*</);
  assert.match(detailSource, /SalesContractApi\.approve/);
  assert.match(detailSource, /Permissions\.Admin\.ContractManagement\.Edit/);
  assert.match(
    detailSource,
    /canUploadSignedScan[\s\S]*contractData\.value\.status === "Approved"/,
  );
});

test("order staff submit a draft for Admin approval before printing or uploading a scan", () => {
  assert.match(orderDetailSource, />\s*Gửi Admin duyệt\s*</);
  assert.match(orderDetailSource, /SalesContractApi\.submitForApproval/);
  assert.match(
    orderDetailSource,
    /canPrintContract[\s\S]*"Approved",\s*"Signed",\s*"Fulfilled"/,
  );
  assert.match(
    orderDetailSource,
    /canUploadSignedScan[\s\S]*contractData\.value\.status === "Approved"/,
  );
  assert.match(apiSource, /sales\/\$\{contractId\}\/submit-for-approval/);
  assert.match(apiSource, /sales\/\$\{contractId\}\/approve/);
  assert.match(
    controllerSource,
    /HttpPost\("\{id:guid\}\/submit-for-approval"\)/,
  );
  assert.match(controllerSource, /HttpPost\("\{id:guid\}\/approve"\)/);
});
