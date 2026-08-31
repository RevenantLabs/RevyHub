#!/usr/bin/env node
/**
 * Verifies every feature slice against the RevyHubX feature contract.
 *
 * The contract is deliberately demanding: a complete slice is a vertical
 * product increment (logic, validation, hooks, UI states, tests, fixtures,
 * request mocks, an end-to-end spec and its own documentation). Meeting it
 * naturally lands above the 20-changed-file threshold without padding.
 *
 * Run: npm run verify:features [-- <slug>]
 */

import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const featuresDir = path.join(root, "features");

export const MINIMUM_FILES = 20;

const RULES = [
  { id: "manifest", label: "manifest.ts", check: (f) => f.includes("manifest.ts") },
  { id: "panel", label: "panel.tsx", check: (f) => f.includes("panel.tsx") },
  { id: "types", label: "types.ts", check: (f) => f.includes("types.ts") },
  { id: "schema", label: "schema.ts (input parsing/validation)", check: (f) => f.includes("schema.ts") },
  { id: "copy", label: "copy.ts (all user-facing strings)", check: (f) => f.includes("copy.ts") },
  {
    id: "lib",
    label: "lib/ — at least 2 modules (logic + error mapping)",
    check: (f) => f.filter((x) => x.startsWith("lib/")).length >= 2
  },
  {
    id: "hooks",
    label: "hooks/ — at least 1 hook",
    check: (f) => f.filter((x) => x.startsWith("hooks/")).length >= 1
  },
  {
    id: "components",
    label: "components/ — at least 4 components (panel, form, result, empty/error)",
    check: (f) => f.filter((x) => x.startsWith("components/")).length >= 4
  },
  {
    id: "tests",
    label: "__tests__/ — at least 5 test files",
    check: (f) => f.filter((x) => x.startsWith("__tests__/")).length >= 5
  },
  {
    id: "a11y",
    label: "__tests__/a11y.test.tsx",
    check: (f) => f.includes("__tests__/a11y.test.tsx")
  },
  {
    id: "fixtures",
    label: "fixtures/ — at least 1 deterministic fixture module",
    check: (f) => f.filter((x) => x.startsWith("fixtures/")).length >= 1
  },
  {
    id: "e2e",
    label: "e2e/<slug>.spec.ts",
    check: (f, slug) => f.includes(`e2e/${slug}.spec.ts`)
  },
  { id: "readme", label: "README.md", check: (f) => f.includes("README.md") }
];

const NETWORK_RULE = {
  id: "msw",
  label: "msw/handlers.ts (required for network-backed tools)",
  check: (f) => f.includes("msw/handlers.ts")
};

async function walk(dir, prefix = "") {
  const out = [];
  const dirents = await readdir(dir, { withFileTypes: true });

  for (const dirent of dirents) {
    const relative = prefix ? `${prefix}/${dirent.name}` : dirent.name;
    if (dirent.isDirectory()) {
      out.push(...(await walk(path.join(dir, dirent.name), relative)));
    } else {
      out.push(relative);
    }
  }

  return out;
}

async function isNetworkBacked(slug) {
  const manifestPath = path.join(featuresDir, slug, "manifest.ts");
  if (!existsSync(manifestPath)) return false;
  const source = await readFile(manifestPath, "utf8");
  const networks = source.match(/networks:\s*\[([^\]]*)\]/)?.[1] ?? "";
  return networks.trim().length > 0;
}

export async function verifySlice(slug) {
  const dir = path.join(featuresDir, slug);
  const files = await walk(dir);
  const rules = [...RULES];

  if (await isNetworkBacked(slug)) rules.push(NETWORK_RULE);

  const failures = rules
    .filter((rule) => !rule.check(files, slug))
    .map((rule) => rule.label);

  if (files.length < MINIMUM_FILES) {
    failures.push(`at least ${MINIMUM_FILES} files (found ${files.length})`);
  }

  return { slug, fileCount: files.length, failures };
}

async function main() {
  const requested = process.argv.slice(2).filter((arg) => !arg.startsWith("-"));

  if (!existsSync(featuresDir)) {
    console.error("features/ does not exist");
    process.exit(1);
  }

  const dirents = await readdir(featuresDir, { withFileTypes: true });
  const slugs = dirents
    .filter((d) => d.isDirectory() && !d.name.startsWith(".") && !d.name.startsWith("_"))
    .map((d) => d.name)
    .filter((slug) => requested.length === 0 || requested.includes(slug))
    .sort();

  if (!slugs.length) {
    console.log("No feature slices found.");
    return;
  }

  const results = [];
  for (const slug of slugs) results.push(await verifySlice(slug));

  const failed = results.filter((result) => result.failures.length);

  for (const result of results) {
    const mark = result.failures.length ? "FAIL" : " OK ";
    console.log(`[${mark}] ${result.slug.padEnd(32)} ${String(result.fileCount).padStart(3)} files`);
    for (const failure of result.failures) console.log(`         missing: ${failure}`);
  }

  console.log(
    `\n${results.length} slice(s) checked, ${failed.length} failing, ` +
      `${results.reduce((sum, r) => sum + r.fileCount, 0)} files total`
  );

  if (failed.length) process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
