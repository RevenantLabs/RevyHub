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

export function implementationPath(root, tool) {
  return path.join(
    root,
    implementationAliases[tool.slug] ?? `features/${tool.slug}`
  );
}

export function isImplemented(root, tool) {
  return existsSync(implementationPath(root, tool));
}
