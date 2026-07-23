import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

const listSource = read(
  "../src/modules/Admin/view/contract/supplier/index.vue",
);
const detailSource = read(
  "../src/modules/Admin/view/contract/supplier/contract-preview.vue",
);
const contractTypes = read("../src/domain/supplier/contract.types.ts");
const contractApi = read("../src/api/supplier/supplier-contract.api.ts");

assert.ok(
  listSource.indexOf('prop: "contractNumber"') <
    listSource.indexOf('prop: "supplierName"'),
  "Số hợp đồng phải là cột dữ liệu đầu tiên",
);
const columnsBlock = listSource.match(
  /const columns = ref<ColumnOption\[\]>\(\[([\s\S]*?)\]\);/,
)?.[1];
assert.ok(columnsBlock, "Không tìm thấy cấu hình cột hợp đồng NCC");
assert.equal(
  (columnsBlock.match(/\bprop:\s*"/g) ?? []).length,
  (columnsBlock.match(/headerAlign:\s*"center"/g) ?? []).length,
  "Tiêu đề tất cả cột phải được căn giữa đồng đều",
);
assert.match(
  listSource,
  /prop:\s*"operation"[\s\S]*?width:\s*1(?:8|9|\d)\d[\s\S]*?fixed:\s*"right"/,
  "Cột thao tác phải cố định bên phải và đủ gọn",
);
assert.match(
  contractTypes,
  /supplierId\?:\s*number/,
  "supplierId phải cùng kiểu number với backend",
);
assert.match(
  listSource,
  /contractItems:\s*contractItems/,
  "Payload tạo/cập nhật phải gửi contractItems đúng contract backend",
);
assert.doesNotMatch(
  listSource,
  /skuPriceList:\s*contractItems/,
  "Không được gửi nhầm contractItems dưới tên skuPriceList",
);
assert.match(
  detailSource,
  /<ReportPageHeader[\s\S]*?title="Chi tiết hợp đồng nhà cung cấp"/,
  "Chi tiết NCC phải dùng cùng header chuẩn với chi tiết hợp đồng mua xe",
);
assert.match(
  detailSource,
  /class="reporting-kpi-grid/,
  "Chi tiết NCC phải có dải KPI cùng ngôn ngữ giao diện hợp đồng mua xe",
);
assert.match(
  detailSource,
  /:xs="24"[\s\S]*?:md="(?:9|10|14|15)"/,
  "Bố cục chi tiết NCC phải xếp một cột trên mobile",
);
assert.equal(
  (detailSource.match(/<style\b/g) ?? []).length,
  1,
  "Vue SFC chi tiết NCC chỉ được có một style block",
);
assert.match(
  detailSource,
  /var\(--el-text-color-primary\)/,
  "Light mode phải dùng token màu của Element Plus",
);
assert.doesNotMatch(
  detailSource,
  /Tính năng tạo phụ lục đang được phát triển/,
  "Không hiển thị nút tạo phụ lục giả chưa có chức năng",
);
assert.match(
  detailSource,
  /uploadContractFile\.execute/,
  "Nút tải chứng từ phải gọi API lưu file thật",
);
assert.match(
  contractApi,
  /uploadFile\(id:\s*string,\s*file:\s*File\)/,
  "API frontend phải có endpoint tải file hợp đồng NCC",
);

console.log("supplier contract workflow regression passed");
