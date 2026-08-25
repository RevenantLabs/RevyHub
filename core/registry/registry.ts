import { generatedPanels } from "@/core/registry/panels.generated";
import { findManifest } from "@/core/registry/manifests";
import type { FeatureEntry } from "@/core/registry/types";

/**
 * Panel lookup used by the `/tools/[slug]` route only.
 *
 * `panels.generated.ts` maps each slug to a `next/dynamic` import so a tool
 * page ships its own panel and nothing else. Both generated files are produced
 * by `scripts/generate-registry.mjs` and are gitignored — that is what lets
 * many feature branches stay open without touching a shared file.
 */
export function findFeature(slug: string): FeatureEntry | undefined {
  const manifest = findManifest(slug);
  const Panel = generatedPanels[slug];
  if (!manifest || !Panel) return undefined;
  return { manifest, Panel };
}

export { featureHref, featureSlugs, manifests, manifestsByCategory } from "@/core/registry/manifests";
