import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const policyDetailPath = '../src/modules/Admin/view/employee/policy/detail.vue';
const policyListPath = '../src/modules/Admin/view/employee/policy/index.vue';

const loadPolicyDetail = () =>
  readFile(new URL(policyDetailPath, import.meta.url), { encoding: 'utf8' });
const loadPolicyList = () =>
  readFile(new URL(policyListPath, import.meta.url), { encoding: 'utf8' });

test('commission policies persist their real product scope', async () => {
  const source = await loadPolicyDetail();

  assert.match(source, /const buildPolicyPayload\s*=\s*\(/);
  assert.match(source, /productId:\s*editForm\.value\.productId/);
  assert.match(source, /categoryId:/);
  assert.match(source, /targetGroup:/);
  assert.match(source, /commissionPolicyApi\.create\(payload\)/);
  assert.match(source, /commissionPolicyApi\.update\(Number\(editForm\.value\.id\),\s*payload\)/);
  assert.match(source, /commissionPolicyApi\.delete\(Number\(editForm\.value\.id\)\)/);
});

test('vehicle, parts and workshop policy forms share product-backed selectors', async () => {
  const source = await loadPolicyDetail();

  assert.match(source, /const departmentProductConfig/);
  assert.match(source, /vehicle_sales:/);
  assert.match(source, /parts_sales:/);
  assert.match(source, /mechanic:/);
  assert.match(source, /v-model="editForm\.productId"/);
  assert.match(source, /v-for="product in productOptions"/);
  assert.match(source, /ProductApi\.getVariantsForInput/);
});

test('general information shows product price for every commission department', async () => {
  const source = await loadPolicyDetail();

  assert.match(source, /priceLabel:\s*"Giá xe"/);
  assert.match(source, /priceLabel:\s*"Giá phụ tùng \/ phụ kiện"/);
  assert.match(source, /priceLabel:\s*"Giá phụ tùng"/);
  assert.match(source, /:label="currentProductConfig\.priceLabel"/);
  assert.doesNotMatch(source, /v-if="editForm\.department === 'vehicle_sales'"\s+label="Giá xe"/);
  assert.match(source, /selectedProductPriceLabel/);
  assert.match(source, /selectedRewardBasePrice/);
});

test('policy detail contains no fabricated performance statistics', async () => {
  const source = await loadPolicyDetail();

  assert.doesNotMatch(source, /Thống kê hiệu suất/);
  assert.doesNotMatch(source, /24\.500\.000/);
  assert.doesNotMatch(source, /Nguyễn Văn A/);
  assert.doesNotMatch(
    source,
    /partsPercentage:\s*dept === "mechanic"\s*\?\s*Number\(p\.value\)\s*\*\s*0\.1/
  );
});

test('policy cards expose parts and technician commission values', async () => {
  const source = await loadPolicyList();

  assert.match(source, /data-testid="policy-commission-value"/);
  assert.match(source, /Phụ tùng \/ phụ kiện/);
  assert.match(source, /Mức hoa hồng kỹ thuật viên/);
  assert.match(source, /formatPercentage\(policy\.laborPercentage\)/);
  assert.match(source, /formatPercentage\(policy\.partsPercentage\)/);
  assert.match(source, /formatPercentage\(policy\.value\)/);
  assert.match(source, /parsePolicyUiConfiguration\(p\.notes\)/);
  assert.match(source, /uiConfiguration\.laborPercentage/);
  assert.match(source, /uiConfiguration\.partsPercentage/);
  assert.match(source, /p\.type === "Percentage"/);
});
