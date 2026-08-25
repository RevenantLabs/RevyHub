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

const advancedWaveIndex = new Map(
  advancedWaveSlugs.map((slug, index) => [slug, index])
);

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
    return {
      difficulty: "advanced",
      wave: "advanced",
      position: waveIndex + 1,
      total: advancedWaveSlugs.length
    };
  }

  return {
    difficulty: "medium",
    catalogDifficulty: tool.difficulty,
    wave: "backlog"
  };
}
