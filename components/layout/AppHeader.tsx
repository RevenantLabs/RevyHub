"use client";

import Image from "next/image";
import Link from "next/link";
import { Github, Network } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useNetwork } from "@/components/stellar/NetworkProvider";
import { getNetworkLabel, networkMeta, normalizeNetwork, stellarNetworks } from "@/lib/stellar/horizon";

export function AppHeader() {
  const { network, setNetwork } = useNetwork();

  return (
    <header className="sticky top-0 z-30 border-b border-white/70 bg-white/75 shadow-[0_14px_38px_rgba(86,103,140,0.16)] backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="relative h-12 w-12 overflow-hidden rounded-lg border border-white bg-[#fff7f1] shadow-[5px_5px_0_#ff8b7a,0_0_30px_rgba(111,212,255,0.28)]">
            <Image
              src="/devtool-profile.png"
              alt="RevyHubX profile character"
              fill
              sizes="48px"
              className="object-cover"
              priority
            />
          </span>
          <span>
            <span className="block text-sm font-semibold text-[#172033]">RevyHubX</span>
            <span className="block text-xs font-semibold text-[#7a5b45]">Anthropomorphic testnet helpers</span>
          </span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <label className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[#7dbcd2]/45 bg-white/75 px-3 text-sm font-semibold text-[#29364d] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
            <Network className="h-4 w-4 text-[#178fb5]" aria-hidden />
            <span className="sr-only sm:not-sr-only">Network</span>
            <select
              value={network}
              onChange={(event) => setNetwork(normalizeNetwork(event.target.value))}
              className="bg-transparent text-sm font-extrabold uppercase text-[#172033] outline-none"
              aria-label="Select Stellar network"
            >
              {stellarNetworks.map((option) => (
                <option key={option} className="bg-white" value={option}>
                  {getNetworkLabel(option)}
                </option>
              ))}
            </select>
          </label>
          <Badge tone={networkMeta[network].tone} aria-live="polite">
            <span className="sr-only">Active network: </span>
            {getNetworkLabel(network)}
          </Badge>
          <a
            href="https://github.com/RevenantLabs/RevyHubX"
            className="hidden items-center gap-2 rounded-md border border-[#c7b9f3]/65 bg-white/60 px-3 py-2 text-sm font-semibold text-[#29364d] transition hover:border-[#ff8b7a]/70 hover:bg-[#fff7f1] sm:inline-flex"
          >
            <Github className="h-4 w-4" aria-hidden />
            GitHub
          </a>
        </div>
      </div>
    </header>
  );
}
