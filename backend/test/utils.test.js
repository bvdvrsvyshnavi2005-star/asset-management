import test from "node:test";
import assert from "node:assert/strict";
import { escapeRegex, parseSort, parsePagination, pageResult, csvEscape, addDays } from "../src/utils/query.js";

test("escapeRegex neutralises regex metacharacters", () => {
  assert.equal(escapeRegex("a.b*c(d)"), "a\\.b\\*c\\(d\\)");
  assert.ok(new RegExp(escapeRegex("(x+")).test("(x+"));
});

test("parseSort only accepts whitelisted fields", () => {
  const allowed = ["name", "warrantyEnd"];
  assert.deepEqual(parseSort("-warrantyEnd", allowed), { warrantyEnd: -1 });
  assert.deepEqual(parseSort("name", allowed), { name: 1 });
  assert.deepEqual(parseSort("password", allowed), { createdAt: -1 });
  assert.deepEqual(parseSort(undefined, allowed, { name: 1 }), { name: 1 });
});

test("parsePagination clamps page and limit", () => {
  assert.deepEqual(parsePagination({ page: "3", limit: "20" }), { page: 3, limit: 20, skip: 40 });
  assert.equal(parsePagination({ page: "-5", limit: "9999" }).limit, 100);
  assert.equal(parsePagination({}).page, 1);
});

test("pageResult computes page count", () => {
  assert.equal(pageResult([], 25, { page: 1, limit: 10 }).pages, 3);
  assert.equal(pageResult([], 0, { page: 1, limit: 10 }).pages, 1);
});

test("csvEscape quotes commas/quotes and formats dates", () => {
  assert.equal(csvEscape('a,"b"'), '"a,""b"""');
  assert.equal(csvEscape(null), "");
  assert.equal(csvEscape(new Date("2026-01-02T00:00:00Z")), "2026-01-02");
});

test("addDays moves forward", () => {
  const base = new Date("2026-01-01T00:00:00Z");
  assert.equal(addDays(10, base).toISOString().slice(0, 10), "2026-01-11");
});

test("csvEscape neutralises spreadsheet formulas", () => {
  assert.equal(csvEscape("=SUM(A1:A9)"), "'=SUM(A1:A9)");
  assert.equal(csvEscape("+1 555"), "'+1 555");
  assert.equal(csvEscape("@cmd"), "'@cmd");
  assert.equal(csvEscape("-2+3"), "'-2+3");
  assert.equal(csvEscape("Dell Latitude"), "Dell Latitude");
  assert.equal(csvEscape(-5), "-5"); // real numbers are left alone
});
