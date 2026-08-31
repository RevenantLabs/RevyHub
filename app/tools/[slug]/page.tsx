import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findFeature } from "@/core/registry/registry";
import { featureSlugs, findManifest } from "@/core/registry/manifests";
import { FeatureShell } from "@/core/ui/FeatureShell";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return featureSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { slug } = await params;
  const manifest = findManifest(slug);

  if (!manifest) return { title: "Tool not found" };

  return {
    title: `${manifest.title} — RevyHubX`,
    description: manifest.description,
    openGraph: {
      title: `${manifest.title} — RevyHubX`,
      description: manifest.description
    }
  };
}

/**
 * Single route for every tool.
 *
 * Feature slices are discovered from `features/` at build time, so adding a
 * tool never requires creating or editing a file under `app/`.
 */
export default async function ToolPage({ params }: RouteParams) {
  const { slug } = await params;
  const feature = findFeature(slug);

  if (!feature) notFound();

  const { manifest, Panel } = feature;

  return (
    <FeatureShell manifest={manifest}>
      <Panel />
    </FeatureShell>
  );
}
