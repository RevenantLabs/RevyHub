import { existsSync } from "node:fs";
import path from "node:path";

/**
 * Tools that were merged before the feature-slice architecture landed.
 *
 * They remain valid implementations, but their route slugs predate the names in
 * the new catalogue. Keeping the aliases here prevents duplicate work from
 * being offered to contributors while those tools are migrated in place.
 */
export const implementationAliases = {
  "asset-metadata": "app/tools/asset-metadata/page.tsx",
  "federation-resolver": "app/tools/federation-resolver/page.tsx",
  "fee-statistics": "app/tools/fee-stats/page.tsx",
  "xdr-decoder": "app/tools/xdr-inspector/page.tsx"
};

/**
 * The first contributor wave. Order is intentional and stable: these twenty
 * issues are published first, five at a time, and are labelled advanced even
 * when the underlying catalogue entry started as medium.
 *
 * Every slug owns a different feature directory, so no issue in the wave
 * depends on another issue or edits another contributor's files.
 */
export const advancedWaveSlugs = [
  "account-signers",
  "account-data-entries",
  "reserve-calculator",
  "sponsored-reserves",
  "sequence-inspector",
  "account-merge-preflight",
  "asset-statistics",
  "liquidity-pool-inspector",
  "claimable-balances",
  "asset-flags-inspector",
  "payment-uri-parser",
  "path-payment-finder",
  "payment-history",
  "amount-converter",
  "batch-address-validator",
  "result-code-explainer",
  "operation-browser",
  "effects-timeline",
  "memo-inspector",
  "preconditions-explainer"
];

/**
 * The second contributor wave.
 *
 * Deliberately harder than the first: every slug here needs recursive decoding,
 * exact integer arithmetic, or a protocol rule that is easy to get confidently
 * wrong. Ten are newly authored tools; ten are the hardest entries left from the
 * original catalogue.
 *
 * As with wave one, every slug owns a different feature directory, so no issue
 * depends on another or edits another contributor's files.
 */
export const advancedWaveTwoSlugs = [
  "soroban-spec-viewer",
  "soroban-auth-inspector",
  "soroban-fee-estimator",
  "contract-events",
  "contract-storage",
  "scval-codec",
  "simulation-explainer",
  "ledger-entry-decoder",
  "multisig-analyzer",
  "sponsorship-planner",
  "claimable-predicate-builder",
  "liquidity-pool-calculator",
  "orderbook-viewer",
  "trade-aggregation-viewer",
  "trade-history",
  "sep7-signature-verifier",
  "sep10-inspector",
  "anchor-discovery",
  "toml-validator",
  "signature-verifier"
];

/** Every slug that belongs to an advanced wave, in publication order. */
export const allAdvancedWaveSlugs = [...advancedWaveSlugs, ...advancedWaveTwoSlugs];

const advancedWaveIndex = new Map(
  allAdvancedWaveSlugs.map((slug, index) => [slug, index])
);

const waveTwoSlugSet = new Set(advancedWaveTwoSlugs);

export function implementationPath(root, tool) {
  return path.join(
    root,
    implementationAliases[tool.slug] ?? `features/${tool.slug}`
  );
}

export function isImplemented(root, tool) {
  return existsSync(implementationPath(root, tool));
}

export function orderForPublication(tools) {
  return [...tools].sort((left, right) => {
    const leftIndex = advancedWaveIndex.get(left.slug) ?? Number.MAX_SAFE_INTEGER;
    const rightIndex = advancedWaveIndex.get(right.slug) ?? Number.MAX_SAFE_INTEGER;
    return leftIndex - rightIndex;
  });
}

export function issueTier(tool) {
  const waveIndex = advancedWaveIndex.get(tool.slug);
  if (waveIndex !== undefined) {
    const inWaveTwo = waveTwoSlugSet.has(tool.slug);

    return {
      difficulty: "advanced",
      wave: inWaveTwo ? "advanced-two" : "advanced",
      position: inWaveTwo ? waveIndex + 1 - advancedWaveSlugs.length : waveIndex + 1,
      total: inWaveTwo ? advancedWaveTwoSlugs.length : advancedWaveSlugs.length
    };
  }

  return {
    difficulty: "medium",
    catalogDifficulty: tool.difficulty,
    wave: "backlog"
  };
}
