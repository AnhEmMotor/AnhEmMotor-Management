import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

const customerCrmPath = resolve(
  projectRoot,
  "src/modules/Marketing/constants/customerCrm.ts",
);

assert.ok(
  existsSync(customerCrmPath),
  `Missing CRM 360 customer constants file at ${customerCrmPath}`,
);
const customerCrmSource = readFileSync(customerCrmPath, "utf8");
const leadApiSource = readFileSync(
  resolve(projectRoot, "src/api/customer/lead.api.ts"),
  "utf8",
);
const marketingMenuSource = readFileSync(
  resolve(projectRoot, "src/modules/Marketing/Menu/index.ts"),
  "utf8",
);

const leadStatuses = [
  "New",
  "Consulting",
  "TestDriving",
  "Deposited",
  "Paperwork",
  "Delivered",
];
const outputStatuses = [
  "pending",
  "waiting_deposit",
  "deposit_paid",
  "waiting_installment",
  "installment_approved",
  "confirmed_cod",
  "paid_processing",
  "delivering",
  "waiting_pickup",
  "completed",
  "cancelled",
  "refunding",
  "refunded",
];

for (const status of leadStatuses) {
  assert.match(
    customerCrmSource,
    new RegExp(`["']${status}["']`),
    `Missing lead status ${status}`,
  );
}

for (const status of outputStatuses) {
  assert.match(
    customerCrmSource,
    new RegExp(`["']${status}["']`),
    `Missing output status ${status}`,
  );
}

assert.match(
  leadApiSource,
  /assignedToId\?: string \| null;/,
  "Lead assignedToId must be typed as string | null",
);
assert.doesNotMatch(
  leadApiSource,
  /assignedToId\?: number \| null;/,
  "Lead assignedToId must not be typed as number | null",
);

const customerRouteBlock = marketingMenuSource.match(
  /path:\s*"customer"[\s\S]*?children:\s*\[/,
)?.[0];

assert.ok(customerRouteBlock, "Customer route must exist in Marketing menu");
assert.match(
  customerRouteBlock,
  /component:\s*""/,
  "Customer nested parent route must use an empty component to avoid rendering a second app layout/sidebar",
);
assert.doesNotMatch(
  customerRouteBlock,
  /component:\s*"\/index\/index"/,
  "Customer nested parent route must not use /index/index because it creates a duplicated sidebar/header",
);

assert.match(
  marketingMenuSource,
  /path:\s*""[\s\S]*?name:\s*"CustomerManagementHome"[\s\S]*?component:\s*"\/Marketing\/view\/customer\/index"/,
  "Customer hub must be kept as the hidden default child route",
);
