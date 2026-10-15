import test from "node:test";
import assert from "node:assert/strict";
import { checkJwtSecret } from "../src/utils/secret.js";

test("dev accepts any secret", () => {
  assert.equal(checkJwtSecret("change-me", "development"), null);
});

test("production rejects short and placeholder secrets", () => {
  assert.match(checkJwtSecret("short", "production"), /at least 32/);
  assert.match(checkJwtSecret("replace-with-a-long-random-string", "production"), /placeholder/);
  assert.match(checkJwtSecret("change-me".padEnd(40, "x"), "production"), /placeholder/);
});

test("production accepts a long random secret", () => {
  assert.equal(checkJwtSecret("9f2c".repeat(16), "production"), null);
});
