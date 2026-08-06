import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateMechanicCommission,
  calculatePartsCommission,
  parseCurrencyInput,
} from "../src/modules/Admin/view/employee/policy/commission-simulator";

test("commission simulator accepts Vietnamese currency input", () => {
  assert.equal(parseCurrencyInput("1.000.000"), 1_000_000);
  assert.equal(parseCurrencyInput("1,000,000 ₫"), 1_000_000);
  assert.equal(parseCurrencyInput(2_500_000), 2_500_000);
});

test("parts commission applies the configured percentage", () => {
  assert.equal(calculatePartsCommission("1.000.000", 10), 100_000);
});

test("mechanic commission combines labor and parts percentages", () => {
  assert.equal(
    calculateMechanicCommission({
      labor: "2.000.000",
      parts: "1.000.000",
      laborPercentage: 15,
      partsPercentage: 10,
    }),
    400_000,
  );
});
