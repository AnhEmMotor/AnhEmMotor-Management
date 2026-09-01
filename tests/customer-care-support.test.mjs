import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const carePageSource = readFileSync(
  resolve(projectRoot, 'src/modules/Marketing/view/customer/care/index.vue'),
  'utf8'
);
const contactApiSource = readFileSync(
  resolve(projectRoot, 'src/api/customer/contact.api.ts'),
  'utf8'
);

assert.match(carePageSource, /fetchGetLeadList/, 'Customer care must load real Lead records');
assert.match(
  carePageSource,
  /fetchCreateLead/,
  'Adding a customer must persist through the Lead API'
);
assert.match(
  carePageSource,
  /fetchAddLeadActivity/,
  'Customer classification and care actions must be persisted'
);
assert.match(
  carePageSource,
  /ContactApi\.getPaginated/,
  'Support chat sessions must load from the Contact API'
);
assert.match(
  carePageSource,
  /ContactApi\.createSupportRequest/,
  'The page must be able to create a support session'
);
assert.match(
  contactApiSource,
  /createSupportRequest[\s\S]*?data:\s*\{\s*request:\s*data\s*\}/,
  'Support request payload must match the backend command envelope'
);
assert.match(
  carePageSource,
  /supportCategoryOptions[\s\S]*?Billing[\s\S]*?Thanh toán & Hóa đơn/,
  'Care intake must use the support request category catalog'
);
assert.match(
  carePageSource,
  /saveCareActivity[\s\S]*?ContactApi\.createSupportRequest/,
  'Care intake must create a request for the contact management workflow'
);
assert.match(
  carePageSource,
  /assignedUserId[\s\S]*?ContactApi\.assign/,
  'Chat session creation must assign the selected support employee'
);
assert.match(
  carePageSource,
  /ContactApi\.getPaginated\(\{[\s\S]*?assignedUserId/,
  'Support chat sessions must be scoped to the signed-in employee'
);
assert.match(
  carePageSource,
  /Tạo phiên chat hỗ trợ/,
  'The assigned workflow must be presented as support chat session creation'
);
assert.doesNotMatch(
  carePageSource,
  /<ElTableColumn label="Phụ trách"/,
  'Customer care must hide the assignee column'
);
assert.match(carePageSource, /ContactApi\.reply/, 'Chat replies must be sent to the backend');
assert.match(
  carePageSource,
  /ContactApi\.updateStatus/,
  'Support session status changes must be persisted'
);
assert.match(
  carePageSource,
  /CustomerClassification/,
  'Customer classification must be explicitly typed'
);
assert.match(
  carePageSource,
  /CLASSIFICATION_ACTIVITY/,
  'Customer classification must be persisted as CRM activity'
);

assert.doesNotMatch(
  carePageSource,
  /const customers = ref\(\[/,
  'Customer care must not use an in-memory customer fixture'
);
assert.doesNotMatch(
  carePageSource,
  /const timeline = ref\(\[/,
  'Customer care must not use a fabricated interaction timeline'
);
assert.doesNotMatch(
  carePageSource,
  /Loyalty|points\s*\}\}|\.points\b|Điểm tích lũy/i,
  'Customer care must not display loyalty scores or points'
);
assert.doesNotMatch(
  carePageSource,
  /\bany\b/,
  'Customer care must not introduce untyped any values'
);

const styleBlocks = carePageSource.match(/<style\b/g) ?? [];
assert.equal(styleBlocks.length, 1, 'Vue SFC must contain exactly one style block');

assert.match(
  carePageSource,
  /:global\(html\.dark \.customer-care-page\)/,
  'Customer care must define an explicit dark palette'
);
assert.match(
  carePageSource,
  /--el-table-bg-color:\s*var\(--care-surface\)/,
  'Customer table surfaces must follow the page theme'
);
assert.equal(
  (carePageSource.match(/class="customer-care-dialog"/g) ?? []).length,
  3,
  'Every teleported customer care dialog must inherit the page theme variables'
);

console.log('Customer care support regression checks passed.');
