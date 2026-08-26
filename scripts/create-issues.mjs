#!/usr/bin/env node
/**
 * Prepares GrantFox-ready issue payloads from the catalogue, five at a time.
 *
 *   npm run issues                     # dry run, next 5
 *   npm run issues -- --json            # exact next-5 payloads for GrantFox
 *   npm run issues -- --slug ledger-lookup
 *   npm run issues -- --list           # show what is published and what is left
 *
 * A slug is skipped when an issue with the same title already exists, or when
 * `features/<slug>/` is already implemented.
 */

import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { catalog, categoryLabels } from "./issue-catalog.mjs";
import { grantfoxConfig } from "./grantfox-config.mjs";
import {
  isImplemented,
  issueTier,
  orderForPublication
} from "./issue-status.mjs";
import { validateCatalog } from "./validate-issue-catalog.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repo = process.env.GH_REPO || "RevenantLabs/RevyHub";

const argv = process.argv.slice(2);
const directApply = argv.includes("--apply");
const jsonOnly = argv.includes("--json");
const listOnly = argv.includes("--list");
const countArg = argv.indexOf("--count");
const slugArg = argv.indexOf("--slug");
const batchSize = countArg === -1 ? 5 : Number(argv[countArg + 1]);
const onlySlug = slugArg === -1 ? null : argv[slugArg + 1];

const CAMPAIGN_LABELS = [
  ...grantfoxConfig.requiredLabels,
  "help wanted",
  "enhancement"
];

const AREA_LABELS = {
  accounts: "area:stellar",
  assets: "area:stellar",
  payments: "area:stellar",
  transactions: "area:stellar",
  soroban: "area:soroban",
  network: "area:stellar",
  keys: "area:security",
  standards: "area:stellar",
  developer: "area:dx"
};

function gh(args, { allowFailure = false } = {}) {
  try {
    return execFileSync("gh", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (error) {
    if (allowFailure) return "";
    throw new Error(String(error.stderr || error.message));
  }
}

function issueTitle(tool) {
  return `[${categoryLabels[tool.category]}] ${tool.title}`;
}

function fileTable() {
  return [
    "| Path | What goes in it |",
    "| --- | --- |",
    "| `manifest.ts` | Registry metadata — title, category, icon, networks, keywords |",
    "| `panel.tsx` | Default export the route mounts |",
    "| `types.ts` | The slice's own types and its error-code union |",
    "| `schema.ts` | Raw input → `Result<Input, Code>`; no requests here |",
    "| `copy.ts` | Every user-facing string, including one entry per error code |",
    "| `lib/<domain>.ts` | The tool's logic, returning `Result` |",
    "| `lib/<domain>.errors.ts` | Transport failures → this tool's codes |",
    "| `lib/format.ts` | Presentation helpers |",
    "| `hooks/use<Name>.ts` | State machine: idle, loading, success, error |",
    "| `components/<Name>Panel.tsx` | Composes the four states |",
    "| `components/<Name>Form.tsx` | Input, using `Field` from `@/core/ui` |",
    "| `components/<Name>Result.tsx` | Success rendering |",
    "| `components/<Name>EmptyState.tsx` | Pre-interaction state |",
    "| `__tests__/<domain>.test.ts` | Logic, including every error path |",
    "| `__tests__/schema.test.ts` | Validation, including boundary values |",
    "| `__tests__/format.test.ts` | Formatting helpers |",
    "| `__tests__/use<Name>.test.tsx` | Hook state transitions |",
    "| `__tests__/<Name>Panel.test.tsx` | Component behaviour through the DOM |",
    "| `__tests__/a11y.test.tsx` | axe, zero WCAG 2.1 A/AA violations, ≥2 states |",
    "| `fixtures/<domain>.fixture.ts` | Deterministic sample data |",
    "| `msw/handlers.ts` | Request mocks (empty array if the tool is offline) |",
    "| `e2e/<slug>.spec.ts` | End-to-end specification |",
    "| `README.md` | What it does, how it works, and the non-obvious decision |"
  ].join("\n");
}

function body(tool) {
  const codes = tool.codes.map(([code, when]) => `| \`${code}\` | ${when} |`).join("\n");
  const criteria = tool.criteria.map((item) => `- [ ] ${item}`).join("\n");
  const outOfScope = tool.outOfScope.map((item) => `- ${item}`).join("\n");
  const offline = tool.offline === true;
  const tier = issueTier(tool);
  const waveCopy = tier.wave === "advanced"
    ? `**Delivery wave.** Advanced issue ${tier.position} of ${tier.total}. It is fully independent: completing any other issue is not a prerequisite.`
    : `**Delivery wave.** ${tier.difficulty === "advanced" ? "Advanced" : "Medium"} backlog. It is fully independent: completing any other issue is not a prerequisite.`;

  return `## What to build

${tool.summary}

**Why it belongs in RevyHubX.** ${tool.why}

${waveCopy}

## Where the data comes from

${tool.source}

${offline ? "This tool is **fully offline** — it must make no network request at all. Set `networks: []` and `offline: true` in the manifest, and export an empty handler array from `msw/handlers.ts`.\n" : ""}
## Scope: one complete feature slice

RevyHubX is built from vertical slices. This issue is **one new directory** under
\`features/${tool.slug}/\` — you should not need to modify any file outside it.
Routing, navigation, the dashboard and search all read a generated registry, so a
new tool appears everywhere the moment its directory exists.

Read **[docs/FEATURE_CONTRACT.md](../blob/main/docs/FEATURE_CONTRACT.md)** first. It is the
specification this issue is written against, and CI enforces it.

Start here:

\`\`\`bash
npm run new:feature -- ${tool.slug} "${tool.title}" ${tool.category}
\`\`\`

That scaffolds all 23 required files, already compiling and passing placeholder
tests. Your work is replacing the placeholders with the real tool.

### Files this slice must contain

${fileTable()}

**Minimum 20 files.** A complete slice lands at 23-25 without padding.

## Acceptance criteria

${criteria}

### Required of every slice

- [ ] Logic returns \`Result<T, Code>\` and never throws for an expected failure
- [ ] All user-facing strings live in \`copy.ts\`, with one entry per error code
- [ ] All four UI states exist: idle, loading, success, error
- [ ] Amounts are handled as strings and \`BigInt\`, never as floats
- [ ] Fixtures are derived from fixed seeds, never hand-typed addresses
- [ ] Requests are mocked with MSW, not \`vi.mock\`
- [ ] \`a11y.test.tsx\` reports zero WCAG 2.1 A/AA violations in at least two states
- [ ] No secret key is ever accepted, displayed, stored or transmitted
- [ ] \`npm run check\` passes
- [ ] \`npm run verify:features -- ${tool.slug}\` reports OK

## Error codes to handle

Every one of these needs an entry in \`copy.ts\` that tells the user what to do next.
\`request_failed\` is a last resort, not a catch-all.

| Code | When it happens |
| --- | --- |
${codes}

## Worth knowing before you start

${tool.notes}

## Reference implementation

\`${tool.reference}\` is the closest existing slice — read it before writing code.
It shows the shape this tool should follow, including how its tests are organised.

## Out of scope

${outOfScope}

## Definition of done

\`\`\`bash
npm run check                            # registry, lint, tests, contract, build
npm run verify:features -- ${tool.slug}
\`\`\`

Both must pass, and your pull request should touch nothing outside
\`features/${tool.slug}/\`. If you find yourself needing to edit a shared file,
say so on this issue rather than working around it — that would be a gap in the
architecture worth fixing properly.
`;
}

function existingTitles() {
  const raw = gh([
    "issue", "list", "-R", repo, "--state", "all", "--limit", "500", "--json", "title"
  ]);
  return new Set(JSON.parse(raw || "[]").map((issue) => issue.title));
}

function labelsFor(tool) {
  const tier = issueTier(tool);
  return [
    ...CAMPAIGN_LABELS,
    AREA_LABELS[tool.category],
    `difficulty:${tier.difficulty}`
  ];
}

function main() {
  validateCatalog();
  if (directApply) {
    throw new Error(
      "Direct GitHub publishing is disabled. Use --json, review the exact payloads, " +
        "then publish them through GrantFox prepare/publish."
    );
  }
  if (batchSize !== 5) {
    throw new Error("Issues are released in fixed batches of five; --count must be 5.");
  }
  const titles = existingTitles();

  const published = catalog.filter((tool) => titles.has(issueTitle(tool)));
  const implemented = catalog.filter((tool) => isImplemented(root, tool));
  const remaining = orderForPublication(
    catalog.filter(
      (tool) => !titles.has(issueTitle(tool)) && !isImplemented(root, tool)
    )
  );

  if (listOnly) {
    console.log(`Catalogue: ${catalog.length} tools`);
    console.log(`  published: ${published.length}`);
    console.log(`  implemented: ${implemented.length}`);
    console.log(`  remaining: ${remaining.length}\n`);
    for (const tool of remaining) {
      const tier = issueTier(tool);
      const order = tier.wave === "advanced" ? `${tier.position}/20` : "later";
      console.log(
        `  ${order.padEnd(7)} ${tier.difficulty.padEnd(8)} ` +
          `${tool.slug.padEnd(28)} ${tool.title}`
      );
    }
    return;
  }

  const batch = onlySlug
    ? remaining.filter((tool) => tool.slug === onlySlug)
    : remaining.slice(0, batchSize);

  if (!batch.length) {
    console.log("Nothing to publish — every catalogue entry is already an issue or a feature.");
    return;
  }

  const payloads = batch.map((tool) => ({
    title: issueTitle(tool),
    body: body(tool),
    labels: labelsFor(tool),
    tier: issueTier(tool),
    slug: tool.slug
  }));

  if (jsonOnly) {
    console.log(JSON.stringify(payloads, null, 2));
    return;
  }

  console.log(
    `Dry run for ${batch.length} GrantFox issue(s) on ${repo}` +
      `  (${remaining.length} remaining in the catalogue)\n`
  );

  for (const payload of payloads) {
    console.log(`── ${payload.title}`);
    console.log(
      `   wave:   ${payload.tier.wave}` +
        (payload.tier.position ? ` ${payload.tier.position}/${payload.tier.total}` : "")
    );
    console.log(`   labels: ${payload.labels.join(", ")}`);
    console.log(`   body:   ${payload.body.length} characters\n`);
  }

  console.log("Re-run with --json, review the payloads, then use GrantFox prepare/publish.");
}

main();
