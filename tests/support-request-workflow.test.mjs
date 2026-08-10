import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');

const menu = read('src/modules/Marketing/Menu/index.ts');
const page = read('src/modules/Marketing/view/contact/index.vue');
const workflow = read('src/modules/Marketing/view/contact/components/SupportWorkflowPanel.vue');
const api = read('src/api/customer/contact.api.ts');

assert.match(menu, /path:\s*["']contact["']/);
assert.match(menu, /Permissions\.Marketing\.ContactManagement\.View/);
assert.match(page, /<SupportWorkflowPanel/);
assert.match(page, /activeItem\?\.status === ["']Assigned["']/);
assert.match(page, /activeItem\?\.status === ["']InProgress["']/);
assert.match(page, /useUserStore/);
assert.match(page, /isAssignedToCurrentUser/);
assert.match(page, /Bắt\s+đầu hỗ trợ/);
assert.doesNotMatch(page, /handleStatus\(["']New["']\)/);
assert.match(workflow, /Tiếp nhận/);
assert.match(workflow, /Đã phân công/);
assert.match(workflow, /Đang hỗ trợ/);
assert.match(workflow, /Hoàn tất/);
assert.match(workflow, /Nhân viên đánh giá khách hàng/);
assert.match(workflow, /Khách hàng đánh giá nhân viên/);
assert.match(workflow, /Lịch sử đánh giá/);
assert.match(workflow, /employeeRatedAt/);
assert.match(workflow, /customerRatedAt/);
assert.doesNotMatch(workflow, /employeeComment/);
assert.doesNotMatch(workflow, /<ElInput/);
assert.match(api, /support-request\/\$\{id\}\/employee-rating/);
