import type { ReactNode } from "react";
import type { FeatureManifest } from "@/core/registry/types";
import { Badge } from "@/core/ui/Badge";

/**
 * The standard chrome every tool page renders inside: title, character line,
 * network badges and a single `<main>`-level heading. Slices supply only the
 * body, which keeps headings and landmarks consistent across the whole app.
 */
export function FeatureShell({
  manifest,
  children
}: {
  manifest: FeatureManifest;
  children: ReactNode;
}) {
  const Icon = manifest.icon;

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-[#fff0e8]">
            <Icon className="h-6 w-6 text-[#ff765f]" aria-hidden />
          </span>
          <h1 className="text-3xl font-bold tracking-normal text-[#172033]">{manifest.title}</h1>
          <Badge tone={manifest.status === "working" ? "success" : "info"}>{manifest.status}</Badge>
          {manifest.offline ? <Badge tone="muted">offline</Badge> : null}
          {manifest.networks.map((network) => (
            <Badge key={network} tone="info">
              {network}
            </Badge>
          ))}
        </div>
        <p className="max-w-3xl text-base leading-7 text-[#4e5c73]">{manifest.description}</p>
        <p className="max-w-3xl text-sm italic leading-6 text-[#8a98aa]">{manifest.character}</p>
      </header>
      {children}
    </div>
  );
}
