import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const policyDetailPath = "../src/modules/Admin/view/employee/policy/detail.vue";

test("vehicle tier reward input captures percent and synchronizes money", async () => {
  const source = await readFile(new URL(policyDetailPath, import.meta.url), {
    encoding: "utf8",
  });

  assert.match(
    source,
    /v-model="tier\.bonusRate"/,
    "tier reward input must bind to a percentage field, not the persisted money amount",
  );
  assert.match(
    source,
    /calculateTierBonusAmount/,
    "policy detail must calculate the VND bonus from the entered percent",
  );
  assert.match(
    source,
    /syncTierBonusAmounts/,
    "policy detail must keep tier.bonus synchronized for the backend payload",
  );
  assert.doesNotMatch(
    source,
    /v-model="tier\.bonus"[\s\S]{0,160}<span class="text-xs text-gray-400">%<\/span>/,
    "the percent suffix must not be attached to the raw VND bonus field",
  );
});

test("vehicle tier simulator uses converted money values", async () => {
  const source = await readFile(new URL(policyDetailPath, import.meta.url), {
    encoding: "utf8",
  });

  assert.match(
    source,
    /getTierBonusAmount\(tier\)/,
    "simulator must read the converted money value for each tier",
  );
  assert.doesNotMatch(
    source,
    /itemsInTier\s*\*\s*Number\(tier\.bonus\)/,
    "simulator must not multiply quantity by a raw percent input",
  );
});

test("vehicle tier fields stay top-aligned when conversion helper text is shown", async () => {
  const source = await readFile(new URL(policyDetailPath, import.meta.url), {
    encoding: "utf8",
  });

  assert.match(
    source,
    /class="flex items-start gap-4 p-3 bg-white border border-gray-200 rounded"/,
    "tier columns must align from the top so helper text does not shift neighboring fields",
  );
  assert.match(
    source,
    /<ElButton[\s\S]{0,180}class="mt-\[30px\]"[\s\S]{0,180}@click="removeTier\(index\)"/,
    "the delete button must remain aligned with the inputs after top-aligning the row",
  );
});
