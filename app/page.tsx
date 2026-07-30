import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  GitPullRequest,
  Rocket,
  SmilePlus,
  Sparkles,
  Wand2
} from "lucide-react";
import { ToolCard } from "@/components/ui/ToolCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { tools, toolCategories } from "@/lib/constants";
import type { ToolCategory } from "@/lib/constants";

export default function HomePage() {
  const groupedTools = tools.reduce<
    Record<ToolCategory, (typeof tools)[number][]>
  >(
    (acc, tool) => {
      if (!acc[tool.category]) acc[tool.category] = [];
      acc[tool.category].push(tool);
      return acc;
    },
    {} as Record<ToolCategory, (typeof tools)[number][]>
  );

  const categoryOrder: ToolCategory[] = ["validation", "balances", "network"];

  return (
    <div className="space-y-16">
      {/* ─── Hero Section ─── */}
      <section className="animate-fade-in-up opacity-0 [animation-delay:100ms] [animation-fill-mode:forwards] grid gap-8 lg:grid-cols-[1fr_0.92fr] lg:items-center">
        <div>
          <div className="animate-fade-in-up opacity-0 [animation-delay:200ms] [animation-fill-mode:forwards]">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#ffd1c6]/80 bg-white/75 px-4 py-1.5 text-sm font-extrabold uppercase tracking-wide text-[#9a6754]">
              <Sparkles className="h-4 w-4 text-[#ff8b7a]" aria-hidden />
              Anthropomorphic Stellar toolkit
            </span>
          </div>

          <h1 className="animate-fade-in-up opacity-0 [animation-delay:350ms] [animation-fill-mode:forwards] mt-4 max-w-4xl text-4xl font-black tracking-tight text-[#172033] sm:text-5xl lg:text-6xl">
            Tools that behave like{" "}
            <span className="bg-gradient-to-r from-[#ff8b7a] to-[#178fb5] bg-clip-text text-transparent">
              helpful characters
            </span>
            .
          </h1>

          <p className="animate-fade-in-up opacity-0 [animation-delay:500ms] [animation-fill-mode:forwards] mt-5 max-w-2xl text-lg leading-8 text-[#4e5c73]">
            A character-led workspace for validating addresses, inspecting testnet
            balances, generating payment QR codes, checking trustlines, and
            exploring developer workflows through a playful cast of human-like
            Stellar mascots.
          </p>

          <div className="animate-fade-in-up opacity-0 [animation-delay:650ms] [animation-fill-mode:forwards] mt-8 flex flex-wrap items-center gap-4">
            <Link href="#tools">
              <Button>
                Explore tools
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </Link>
            <Link
              href="https://github.com/RevenantLabs/RevyHubX"
              className="inline-flex items-center gap-2 rounded-md border border-[#c7b9f3]/65 bg-white/60 px-4 py-2.5 text-sm font-extrabold text-[#29364d] transition hover:border-[#ff8b7a]/70 hover:bg-[#fff7f1]"
            >
              <GitPullRequest className="h-4 w-4" aria-hidden />
              View on GitHub
            </Link>
          </div>

          <div className="animate-fade-in-up opacity-0 [animation-delay:800ms] [animation-fill-mode:forwards] mt-8 grid gap-3 sm:grid-cols-3">
            {[
              ["8", "tool modules"],
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

        <div className="animate-fade-in-up opacity-0 [animation-delay:400ms] [animation-fill-mode:forwards] relative">
          <div className="absolute -left-4 top-5 h-full w-full rounded-[1.5rem] bg-gradient-to-br from-[#ff8b7a] to-[#ffd1c6]" aria-hidden />
          <div className="relative overflow-hidden rounded-[1.5rem] border border-white bg-white/82 p-3 shadow-[0_24px_70px_rgba(84,102,136,0.18)] transition-shadow duration-300 hover:shadow-[0_24px_80px_rgba(255,139,122,0.28)]">
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

      {/* ─── Feature Highlights ─── */}
      <section className="animate-fade-in-up opacity-0 [animation-delay:900ms] [animation-fill-mode:forwards] grid gap-4 lg:grid-cols-3">
        <div className="flex gap-4 rounded-lg border border-white/80 bg-white/60 p-5 shadow-[4px_4px_0_rgba(255,139,122,0.14)] transition hover:shadow-[4px_4px_0_rgba(255,139,122,0.32)]">
          <SmilePlus className="mt-0.5 h-5 w-5 shrink-0 text-[#ff765f]" aria-hidden />
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wide text-[#9a6754]">Character-driven</h3>
            <p className="mt-1 text-sm leading-6 text-[#4e5c73]">
              Expressive faces, gestures, and small roles make each utility easier to remember.
            </p>
          </div>
        </div>
        <div className="flex gap-4 rounded-lg border border-white/80 bg-white/60 p-5 shadow-[4px_4px_0_rgba(142,220,244,0.2)] transition hover:shadow-[4px_4px_0_rgba(142,220,244,0.4)]">
          <Wand2 className="mt-0.5 h-5 w-5 shrink-0 text-[#178fb5]" aria-hidden />
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wide text-[#146783]">Approachable</h3>
            <p className="mt-1 text-sm leading-6 text-[#4e5c73]">
              Complex Stellar actions stay approachable without faking blockchain data.
            </p>
          </div>
        </div>
        <div className="flex gap-4 rounded-lg border border-white/80 bg-white/60 p-5 shadow-[4px_4px_0_rgba(199,185,243,0.22)] transition hover:shadow-[4px_4px_0_rgba(199,185,243,0.44)]">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[#5b4b8a]" aria-hidden />
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wide text-[#5b4b8a]">Open source</h3>
            <p className="mt-1 text-sm leading-6 text-[#4e5c73]">
              Roadmap and issues designed for contributors. Ready for GrantFox.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Project Info ─── */}
      <section className="animate-fade-in-up opacity-0 [animation-delay:1000ms] [animation-fill-mode:forwards] grid gap-4 lg:grid-cols-3">
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
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex gap-3 text-sm text-[#4e5c73]">
                <Activity className="mt-0.5 h-4 w-4 shrink-0 text-stellar-green" aria-hidden />
                <span>Real Horizon and Friendbot calls on testnet</span>
              </div>
              <div className="flex gap-3 text-sm text-[#4e5c73]">
                <GitPullRequest className="mt-0.5 h-4 w-4 shrink-0 text-stellar-violet" aria-hidden />
                <span>Roadmap and issues designed for contributors</span>
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

      {/* ─── Tools by Category ─── */}
      <section id="tools">
        <div className="mb-8">
          <h2 className="text-3xl font-black text-[#172033]">Helper cast</h2>
          <p className="mt-2 max-w-2xl text-sm text-[#68758a]">
            Each tool has a role, a mood, and a clear task so the Stellar workflow feels visual and memorable.
          </p>
        </div>

        {categoryOrder.map((category, catIndex) => (
          <div key={category} className="mb-10 last:mb-0">
            <div
              className="animate-fade-in-up opacity-0 [animation-fill-mode:forwards] mb-4"
              style={{ animationDelay: `${100 + catIndex * 100}ms` }}
            >
              <h3 className="text-lg font-extrabold text-[#172033]">
                {toolCategories[category].label}
              </h3>
              <p className="mt-1 text-sm text-[#68758a]">
                {toolCategories[category].description}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {groupedTools[category].map((tool, toolIndex) => (
                <div
                  key={tool.href}
                  className="animate-fade-in-up opacity-0 [animation-fill-mode:forwards]"
                  style={{
                    animationDelay: `${200 + catIndex * 100 + toolIndex * 80}ms`
                  }}
                >
                  <ToolCard {...tool} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
