import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const listPath = new URL(
  "../src/modules/Admin/view/contract/sales/index.vue",
  import.meta.url,
);
const detailPath = new URL(
  "../src/modules/Admin/view/contract/sales/contract-preview.vue",
  import.meta.url,
);
const typesPath = new URL(
  "../src/domain/sales/contract.types.ts",
  import.meta.url,
);

const listSource = readFileSync(listPath, "utf8");
const detailSource = readFileSync(detailPath, "utf8");
const typesSource = readFileSync(typesPath, "utf8");

test("sales-contract list maps the backend customer and vehicle fields", () => {
  assert.match(typesSource, /customerFullName\??:\s*string/);
  assert.match(typesSource, /vehicleModel\??:\s*string/);
  assert.match(typesSource, /finalPaymentDeadline\??:\s*string/);
  assert.match(listSource, /const mapSalesContractRow\s*=/);
  assert.match(listSource, /customerName:\s*contract\.customerFullName/);
  assert.match(listSource, /vehicle:\s*formatVehicleTransaction\(contract\)/);
  assert.match(
    listSource,
    /deliveryDeadline:\s*contract\.finalPaymentDeadline/,
  );
});

test("delivery deadline shows an exact Vietnam date and a relative calendar-day hint", () => {
  assert.match(
    listSource,
    /const VIETNAM_TIME_ZONE\s*=\s*["']Asia\/Ho_Chi_Minh["']/,
  );
  assert.match(listSource, /timeZone:\s*VIETNAM_TIME_ZONE/);
  assert.match(listSource, /getDeliveryDeadlineHint/);
  assert.match(listSource, /Còn \$\{days\} ngày/);
  assert.match(listSource, /Trễ \$\{Math\.abs\(days\)\} ngày/);
  assert.match(listSource, /formatDate\(scope\.row\.deliveryDeadline\)/);
  assert.match(
    listSource,
    /getDeliveryDeadlineHint\(scope\.row\.deliveryDeadline\)/,
  );
});

test("the list has one contract entry action and keeps upload inside detail", () => {
  assert.equal(
    (listSource.match(/goToPreview\(scope\.row\.id\)/g) || []).length,
    1,
  );
  assert.doesNotMatch(listSource, /Xem trước\s*&amp;\s*Chỉnh sửa/);
  assert.doesNotMatch(listSource, /Tải lên bản quét PDF/);
  assert.doesNotMatch(listSource, /Ký HĐ để giao xe/);
  assert.doesNotMatch(listSource, /Tạo phụ lục/i);
  assert.doesNotMatch(listSource, /contract-file-upload/);
  assert.match(detailSource, /:http-request="customUploadRequest"/);
  assert.match(listSource, /goToPreview\(createdContractId\)/);
});

test("detail removes addendum actions and all visible statuses are Vietnamese", () => {
  assert.doesNotMatch(detailSource, /handleCreateAddendum/);
  assert.doesNotMatch(detailSource, /DocumentCopy/);
  assert.doesNotMatch(detailSource, /Tạo Phụ Lục/i);
  assert.doesNotMatch(
    listSource,
    /Nháp \(Draft\)|Đã ký \(Signed\)|Hoàn tất \(Fulfilled\)/,
  );
  assert.doesNotMatch(detailSource, /trạng thái Signed|\(Fulfilled\)/);
  assert.match(listSource, /Draft:\s*["']Nháp["']/);
  assert.match(listSource, /Signed:\s*["']Đã ký["']/);
  assert.match(listSource, /Fulfilled:\s*["']Hoàn tất["']/);
});
