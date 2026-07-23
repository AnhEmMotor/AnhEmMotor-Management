import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const detailPath = new URL(
  "../src/modules/Admin/view/contract/sales/contract-preview.vue",
  import.meta.url,
);
const detailSource = readFileSync(detailPath, "utf8");
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
  assert.match(detailSource, /@click="handleApproveContract"/);
  assert.match(detailSource, />\s*Duyệt Hợp Đồng\s*</);
  assert.match(detailSource, /status:\s*"Approved"/);
  assert.match(
    detailSource,
    /Permissions\.Order\.OrderManagement\.ChangeStatus/,
  );
  assert.match(
    detailSource,
    /canUploadSignedScan[\s\S]*contractData\.value\.status === "Approved"/,
  );
});
