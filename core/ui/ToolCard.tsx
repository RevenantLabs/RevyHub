import Link from "next/link";
import type { FeatureManifest } from "@/core/registry/types";
import { Badge } from "@/core/ui/Badge";
import { featureHref } from "@/core/registry/registry";

const statusTone = {
  working: "success",
  beta: "info",
  experimental: "warning"
} as const;

export function ToolCard({ manifest }: { manifest: FeatureManifest }) {
  const Icon = manifest.icon;

  return (
    <Link
      href={featureHref(manifest.slug)}
      className="group flex flex-col gap-3 rounded-lg border border-white/80 bg-white/75 p-5 shadow-[4px_4px_0_rgba(255,139,122,0.16)] transition hover:-translate-y-0.5 hover:shadow-[6px_6px_0_rgba(255,139,122,0.24)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#47a8c7] focus-visible:ring-offset-2"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[#fff0e8]">
          <Icon className="h-5 w-5 text-[#ff765f]" aria-hidden />
        </span>
        <Badge tone={statusTone[manifest.status]}>{manifest.status}</Badge>
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-bold text-[#172033]">{manifest.title}</h3>
        <p className="text-sm leading-6 text-[#4e5c73]">{manifest.description}</p>
      </div>
      <p className="mt-auto text-xs italic leading-5 text-[#8a98aa]">{manifest.character}</p>
    </Link>
  );
}
