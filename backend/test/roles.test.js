import test from "node:test";
import assert from "node:assert/strict";
import { authorize } from "../src/middleware/roles.js";

const run = (mw, user) => {
  let err;
  mw({ user }, {}, (e) => { err = e; });
  return err;
};

test("authorize allows listed roles", () => {
  assert.equal(run(authorize("ADMIN", "IT_STAFF"), { role: "IT_STAFF" }), undefined);
});

test("authorize rejects other roles with 403", () => {
  assert.equal(run(authorize("ADMIN"), { role: "EMPLOYEE" }).status, 403);
});

test("authorize rejects unauthenticated with 401", () => {
  assert.equal(run(authorize("ADMIN"), undefined).status, 401);
});
