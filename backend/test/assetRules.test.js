import test from "node:test";
import assert from "node:assert/strict";
import { assertCanAssign, assertCanReturn, assertCanTransfer } from "../src/services/assetRules.js";

const status409 = (fn) => {
  try { fn(); } catch (e) { return e.status; }
  return undefined;
};

test("assign: only AVAILABLE assets", () => {
  assert.equal(status409(() => assertCanAssign({ status: "AVAILABLE" })), undefined);
  for (const status of ["ASSIGNED", "MAINTENANCE", "RETIRED"]) {
    assert.equal(status409(() => assertCanAssign({ status })), 409, status);
  }
});

test("transfer: only ASSIGNED assets, and not to the current holder", () => {
  const asset = { status: "ASSIGNED", assignedTo: "emp1" };
  assert.equal(status409(() => assertCanTransfer(asset, "emp2")), undefined);
  assert.equal(status409(() => assertCanTransfer(asset, "emp1")), 409);
  assert.equal(status409(() => assertCanTransfer({ status: "AVAILABLE", assignedTo: null }, "emp2")), 409);
  assert.equal(status409(() => assertCanTransfer({ status: "MAINTENANCE", assignedTo: "emp1" }, "emp2")), 409);
});

test("return: only ASSIGNED assets with a holder", () => {
  assert.equal(status409(() => assertCanReturn({ status: "ASSIGNED", assignedTo: "emp1" })), undefined);
  assert.equal(status409(() => assertCanReturn({ status: "ASSIGNED", assignedTo: null })), 409);
  assert.equal(status409(() => assertCanReturn({ status: "AVAILABLE", assignedTo: null })), 409);
  assert.equal(status409(() => assertCanReturn({ status: "MAINTENANCE", assignedTo: "emp1" })), 409);
});
