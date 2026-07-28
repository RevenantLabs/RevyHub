import Image from "next/image";
import { Activity, GitPullRequest, Rocket, SmilePlus, Wand2 } from "lucide-react";
import { ToolCard } from "@/components/ui/ToolCard";
import { SorobanRpcPanel } from "@/components/stellar/SorobanRpcPanel";
import { Card } from "@/components/ui/Card";
import { tools } from "@/lib/constants";

export default function HomePage() {
  return (
    <div className="space-y-10">
      {/* TODO(issue #1): Improve this dashboard with richer responsive storytelling, tool grouping, and visual hierarchy. */}
      <section className="grid gap-8 lg:grid-cols-[1fr_0.92fr] lg:items-center">
        <div>
          <p className="inline-flex rounded-full border border-[#ffd1c6]/80 bg-white/75 px-3 py-1 text-sm font-semibold uppercase tracking-wide text-[#9a6754]">
            Anthropomorphic Stellar toolkit
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-normal text-[#172033] sm:text-5xl">
            RevyHubX, with tools that behave like helpful characters.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#4e5c73]">
            A character-led workspace for validating addresses, inspecting testnet
            balances, generating payment QR codes, checking trustlines, and
            exploring developer workflows through a playful cast of human-like
            Stellar mascots.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="flex gap-3 rounded-lg border border-white/80 bg-white/60 p-4 shadow-[4px_4px_0_rgba(255,139,122,0.14)]">
              <SmilePlus className="mt-0.5 h-5 w-5 text-[#ff765f]" aria-hidden />
              <p className="text-sm leading-6 text-[#4e5c73]">
                Expressive faces, gestures, and small roles make each utility easier to remember.
              </p>
            </div>
            <div className="flex gap-3 rounded-lg border border-white/80 bg-white/60 p-4 shadow-[4px_4px_0_rgba(142,220,244,0.2)]">
              <Wand2 className="mt-0.5 h-5 w-5 text-[#178fb5]" aria-hidden />
              <p className="text-sm leading-6 text-[#4e5c73]">
                Complex Stellar actions stay approachable without faking blockchain data.
              </p>
            </div>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              ["7", "tool modules"],
              ["Testnet", "default network"],
              ["25", "issue ideas"]
            ].map(([value, label]) => (
              <div key={label} className="rounded-lg border border-white/80 bg-white/60 p-4 shadow-[4px_4px_0_rgba(199,185,243,0.22)]">
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

      <SorobanRpcPanel />

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Rocket className="h-5 w-5 text-[#178fb5]" aria-hidden />
              <h2 className="text-lg font-semibold text-[#172033]">GrantFox MVP focus</h2>
            </div>
            <p className="text-sm leading-6 text-[#4e5c73]">
              This project is prepared as a modular, contributor-friendly Stellar
              open-source demo. Working tools are prioritized, while advanced
              integrations are split into small future issues.
            </p>
            <div className="grid gap-3">
              <div className="flex gap-3 text-sm text-[#4e5c73]">
                <Activity className="mt-0.5 h-4 w-4 text-stellar-green" aria-hidden />
                Real Horizon and Friendbot calls on testnet
              </div>
              <div className="flex gap-3 text-sm text-[#4e5c73]">
                <GitPullRequest className="mt-0.5 h-4 w-4 text-stellar-violet" aria-hidden />
                Roadmap and issues designed for contributors
              </div>
            </div>
          </div>
        </Card>
        <Card className="border-[#ffd1c6]/80 bg-[#fff7f1]/75">
          <h2 className="text-lg font-semibold text-[#172033]">Theme direction</h2>
          <p className="mt-3 text-sm leading-6 text-[#4e5c73]">
            Anthropomorphic design turns stars, wallets, rockets, and utility
            objects into friendly helpers with clear emotions, posture, and purpose.
          </p>
        </Card>
      </section>

      <section>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black text-[#172033]">Helper cast</h2>
            <p className="mt-2 text-sm text-[#68758a]">
              Each tool has a role, a mood, and a clear task so the Stellar workflow feels visual and memorable.
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tools.map((tool) => (
            <ToolCard key={tool.href} {...tool} />
          ))}
        </div>
      </section>
    </div>
  );
}
