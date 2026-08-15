import test from "node:test";
import assert from "node:assert/strict";

import { computePercentages, buildSvg } from "./contribution-radar.mjs";

test("percentages sum to exactly 100", () => {
  const pct = computePercentages({ commits: 1234, issues: 131, pullRequests: 330, codeReview: 507 });
  const total = Object.values(pct).reduce((a, b) => a + b, 0);
  assert.equal(total, 100);
});

test("largest-remainder rounding beats naive rounding", () => {
  // Naive Math.round on 1/3 splits yields 33+33+33+33 = 132 for four equal parts.
  const pct = computePercentages({ commits: 1, issues: 1, pullRequests: 1, codeReview: 1 });
  assert.equal(Object.values(pct).reduce((a, b) => a + b, 0), 100);
  assert.deepEqual(Object.values(pct).sort((a, b) => a - b), [25, 25, 25, 25]);
});

test("remainder goes to the largest fractional part", () => {
  const pct = computePercentages({ commits: 5, issues: 1, pullRequests: 1, codeReview: 1 });
  // 62.5 / 12.5 / 12.5 / 12.5 -> 62 or 63 for commits, 12 or 13 for the rest, summing to 100.
  assert.equal(Object.values(pct).reduce((a, b) => a + b, 0), 100);
  assert.ok(pct.commits >= 62 && pct.commits <= 63);
});

test("all-zero contributions produce zeroes, not NaN", () => {
  const pct = computePercentages({ commits: 0, issues: 0, pullRequests: 0, codeReview: 0 });
  assert.deepEqual(pct, { commits: 0, issues: 0, pullRequests: 0, codeReview: 0 });
});

test("svg renders labels, percentages and a polygon", () => {
  const svg = buildSvg({ commits: 56, issues: 6, pullRequests: 15, codeReview: 23 });
  assert.match(svg, /^<svg /);
  assert.match(svg, /<\/svg>\n?$/);
  for (const label of ["Commits", "Issues", "Pull requests", "Code review"]) {
    assert.ok(svg.includes(label), `missing label ${label}`);
  }
  assert.ok(svg.includes("56%"));
  assert.ok(svg.includes("<polygon"));
});

test("svg is safe when every value is zero", () => {
  const svg = buildSvg({ commits: 0, issues: 0, pullRequests: 0, codeReview: 0 });
  assert.doesNotMatch(svg, /NaN/);
});
