import Image from "next/image";
import { Boxes, ShieldCheck, Wand2 } from "lucide-react";
import { ToolCard } from "@/core/ui/ToolCard";
import { manifests, manifestsByCategory } from "@/core/registry/manifests";
import { FEATURE_CATEGORY_LABELS } from "@/core/registry/types";

export default function HomePage() {
  const groups = manifestsByCategory();
  const offlineCount = manifests.filter((manifest) => manifest.offline).length;

  return (
    <div className="space-y-12">
      <section className="grid gap-8 lg:grid-cols-[1fr_0.92fr] lg:items-center">
        <div>
          <p className="inline-flex rounded-full border border-[#ffd1c6]/80 bg-white/75 px-3 py-1 text-sm font-semibold uppercase tracking-wide text-[#9a6754]">
            Anthropomorphic Stellar toolkit
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-normal text-[#172033] sm:text-5xl">
            RevyHubX, with tools that behave like helpful characters.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#4e5c73]">
            A character-led workspace for inspecting accounts, assets, transactions and
            Soroban contracts. Every tool is an independent module with its own logic,
            tests and documentation.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="flex gap-3 rounded-lg border border-white/80 bg-white/60 p-4 shadow-[4px_4px_0_rgba(255,139,122,0.14)]">
              <Boxes className="mt-0.5 h-5 w-5 shrink-0 text-[#ff765f]" aria-hidden />
              <p className="text-sm leading-6 text-[#4e5c73]">
                Each tool is a self-contained vertical slice, so contributors never
                collide on shared files.
              </p>
            </div>
            <div className="flex gap-3 rounded-lg border border-white/80 bg-white/60 p-4 shadow-[4px_4px_0_rgba(142,220,244,0.2)]">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#178fb5]" aria-hidden />
              <p className="text-sm leading-6 text-[#4e5c73]">
                Read-only by design. RevyHubX never asks for a secret key and never
                signs a transaction for you.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              [String(manifests.length), "tool modules"],
              [String(groups.length), "categories"],
              [String(offlineCount), "fully offline"]
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-lg border border-white/80 bg-white/60 p-4 shadow-[4px_4px_0_rgba(199,185,243,0.22)]"
              >
                <p className="text-2xl font-bold text-[#172033]">{value}</p>
                <p className="text-sm text-[#68758a]">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-4 top-5 h-full w-full rounded-[1.5rem] bg-[#ff8b7a]" aria-hidden />
          <div className="relative overflow-hidden rounded-[1.5rem] border border-white bg-white/82 p-3 shadow-[0_24px_70px_rgba(84,102,136,0.18)]">
            <Image
              src="/anthropomorphic-stellar-hero.png"
              alt="Anthropomorphic Stellar tool characters including a star engineer, moon wallet, and rocket assistant"
              width={1024}
              height={1536}
              priority
              className="h-auto w-full rounded-[1.1rem]"
            />
          </div>
        </div>
      </section>

      {groups.length === 0 ? (
        <section className="rounded-lg border border-dashed border-[#c7d6e8] bg-white/50 p-10 text-center">
          <Wand2 className="mx-auto h-8 w-8 text-[#5b4b8a]" aria-hidden />
          <p className="mt-3 text-base font-bold text-[#172033]">No tools are registered yet</p>
          <p className="mt-1 text-sm text-[#68758a]">
            Run <code className="font-mono">npm run new:feature</code> to scaffold the first one.
          </p>
        </section>
      ) : (
        groups.map((group) => (
          <section key={group.category} className="space-y-4">
            <h2 className="text-xl font-bold text-[#172033]">
              {FEATURE_CATEGORY_LABELS[group.category]}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {group.entries.map((manifest) => (
                <ToolCard key={manifest.slug} manifest={manifest} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
