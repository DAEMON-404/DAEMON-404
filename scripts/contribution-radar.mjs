#!/usr/bin/env node
// Contribution radar ("kite") chart for the DAEMON-404 profile README.
//
// Pulls the four contribution counters GitHub tracks for a user, normalises them
// to percentages, and draws a four-axis radar chart in the Rose Pine palette used
// throughout the README. Output: dist/contribution-radar.svg
//
// Usage: GITHUB_TOKEN=<pat> node scripts/contribution-radar.mjs [username] [outfile]

import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

// Rose Pine dawn, matching the badge/divider palette in README.md.
const PALETTE = {
  bg: "#1a1620",
  axis: "#907aa9",
  kiteStroke: "#d7827e",
  kiteFill: "#d7827e",
  vertex: "#ea9d34",
  label: "#f2e0d8",
  percent: "#56949f",
};

const FONT = "'JetBrains Mono', 'SFMono-Regular', Consolas, monospace";

const WIDTH = 760;
const HEIGHT = 420;
const RADIUS = 130;

// Axis order matches the layout the chart is modelled on: code review up,
// issues right, pull requests down, commits left.
const AXES = [
  { key: "codeReview", label: "Code review", angle: -90 },
  { key: "issues", label: "Issues", angle: 0 },
  { key: "pullRequests", label: "Pull requests", angle: 90 },
  { key: "commits", label: "Commits", angle: 180 },
];

const QUERY = `query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      totalCommitContributions
      totalIssueContributions
      totalPullRequestContributions
      totalPullRequestReviewContributions
    }
  }
}`;

/**
 * Normalise raw counts to integer percentages summing to exactly 100.
 * Uses largest-remainder (Hare quota) so naive rounding cannot overshoot.
 */
export function computePercentages(counts) {
  const keys = Object.keys(counts);
  const total = keys.reduce((sum, k) => sum + counts[k], 0);
  if (total === 0) return Object.fromEntries(keys.map((k) => [k, 0]));

  const exact = keys.map((k) => ({ key: k, value: (counts[k] / total) * 100 }));
  const result = Object.fromEntries(exact.map(({ key, value }) => [key, Math.floor(value)]));

  let remaining = 100 - Object.values(result).reduce((a, b) => a + b, 0);
  const byRemainder = [...exact].sort(
    (a, b) => (b.value - Math.floor(b.value)) - (a.value - Math.floor(a.value)),
  );
  for (let i = 0; remaining > 0; i++, remaining--) {
    result[byRemainder[i % byRemainder.length].key] += 1;
  }
  return result;
}

const point = (angleDeg, distance) => {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: WIDTH / 2 + Math.cos(rad) * distance,
    y: HEIGHT / 2 + Math.sin(rad) * distance,
  };
};

const round = (n) => Math.round(n * 100) / 100;

/** Render the radar chart as a standalone SVG string. */
export function buildSvg(percentages) {
  const max = Math.max(...AXES.map((a) => percentages[a.key] ?? 0));
  // Scale the shape against the largest slice so the kite always fills the frame.
  // A zeroed profile collapses to the centre point rather than dividing by zero.
  const scale = max > 0 ? RADIUS / max : 0;

  const axisLines = AXES.map((axis) => {
    const tip = point(axis.angle, RADIUS);
    return `  <line x1="${WIDTH / 2}" y1="${HEIGHT / 2}" x2="${round(tip.x)}" y2="${round(tip.y)}" stroke="${PALETTE.axis}" stroke-width="2" stroke-linecap="round" opacity="0.75"/>`;
  }).join("\n");

  const vertices = AXES.map((axis) => ({
    axis,
    ...point(axis.angle, (percentages[axis.key] ?? 0) * scale),
  }));

  const polygon = vertices.map((v) => `${round(v.x)},${round(v.y)}`).join(" ");

  const dots = vertices
    .map(
      (v) =>
        `  <circle cx="${round(v.x)}" cy="${round(v.y)}" r="5" fill="${PALETTE.bg}" stroke="${PALETTE.vertex}" stroke-width="3"/>`,
    )
    .join("\n");

  // Labels sit past the end of each axis; anchor and baseline follow the direction.
  const labels = AXES.map((axis) => {
    const anchorPoint = point(axis.angle, RADIUS + 34);
    const pct = percentages[axis.key] ?? 0;
    const horizontal = axis.angle === 0 || axis.angle === 180;
    const anchor = horizontal ? (axis.angle === 0 ? "start" : "end") : "middle";
    const pctY = horizontal ? anchorPoint.y - 10 : axis.angle === -90 ? anchorPoint.y - 14 : anchorPoint.y + 6;
    const labelY = pctY + 26;
    return [
      `  <text x="${round(anchorPoint.x)}" y="${round(pctY)}" text-anchor="${anchor}" fill="${PALETTE.percent}" font-family="${FONT}" font-size="21" font-weight="700">${pct}%</text>`,
      `  <text x="${round(anchorPoint.x)}" y="${round(labelY)}" text-anchor="${anchor}" fill="${PALETTE.label}" font-family="${FONT}" font-size="17">${axis.label}</text>`,
    ].join("\n");
  }).join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-label="Contribution breakdown radar chart">
  <rect width="${WIDTH}" height="${HEIGHT}" rx="12" fill="${PALETTE.bg}"/>
${axisLines}
  <polygon points="${polygon}" fill="${PALETTE.kiteFill}" fill-opacity="0.3" stroke="${PALETTE.kiteStroke}" stroke-width="2.5" stroke-linejoin="round"/>
${dots}
${labels}
</svg>
`;
}

async function fetchCounts(login, token) {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "daemon-404-contribution-radar",
    },
    body: JSON.stringify({ query: QUERY, variables: { login } }),
  });

  if (!response.ok) {
    throw new Error(`GitHub GraphQL request failed: ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();
  if (payload.errors?.length) {
    throw new Error(`GitHub GraphQL errors: ${payload.errors.map((e) => e.message).join("; ")}`);
  }

  const c = payload.data?.user?.contributionsCollection;
  if (!c) throw new Error(`No contributionsCollection returned for user "${login}"`);

  return {
    commits: c.totalCommitContributions,
    issues: c.totalIssueContributions,
    pullRequests: c.totalPullRequestContributions,
    codeReview: c.totalPullRequestReviewContributions,
  };
}

async function main() {
  const login = process.argv[2] || process.env.GITHUB_LOGIN || "DAEMON-404";
  const outFile = process.argv[3] || "dist/contribution-radar.svg";
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN is required");

  const counts = await fetchCounts(login, token);
  const percentages = computePercentages(counts);
  console.log("counts:", counts);
  console.log("percentages:", percentages);

  await mkdir(dirname(outFile), { recursive: true });
  await writeFile(outFile, buildSvg(percentages), "utf8");
  console.log(`wrote ${outFile}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
