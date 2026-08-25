import { generatedManifests } from "@/core/registry/manifests.generated";
import {
  FEATURE_CATEGORIES,
  type FeatureCategory,
  type FeatureManifest
} from "@/core/registry/types";

/**
 * Manifest-only view of the registry.
 *
 * Navigation, the dashboard and search import from here so that listing tools
 * never pulls a single feature panel into the bundle.
 */
export const manifests: readonly FeatureManifest[] = [...generatedManifests].sort((a, b) =>
  a.title.localeCompare(b.title)
);

const bySlug = new Map(manifests.map((manifest) => [manifest.slug, manifest]));

export function findManifest(slug: string): FeatureManifest | undefined {
  return bySlug.get(slug);
}

export function featureSlugs(): string[] {
  return manifests.map((manifest) => manifest.slug);
}

export function featureHref(slug: string): string {
  return `/tools/${slug}`;
}

export function manifestsByCategory(): Array<{
  category: FeatureCategory;
  entries: FeatureManifest[];
}> {
  return FEATURE_CATEGORIES.map((category) => ({
    category,
    entries: manifests.filter((manifest) => manifest.category === category)
  })).filter((group) => group.entries.length > 0);
}

export function searchManifests(query: string): FeatureManifest[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [...manifests];

  return manifests.filter((manifest) =>
    [manifest.title, manifest.description, manifest.slug, ...manifest.keywords]
      .join(" ")
      .toLowerCase()
      .includes(needle)
  );
}
