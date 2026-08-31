"use client";

import Image from "next/image";
import Link from "next/link";
import { Github, Menu, Network, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/core/ui/Badge";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isStellarNetwork } from "@/core/network/types";
import { SidebarNav } from "@/core/layout/Sidebar";

export function AppHeader() {
  const { network, setNetwork } = useNetwork();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-white/70 bg-white/75 shadow-[0_14px_38px_rgba(86,103,140,0.16)] backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-tool-nav"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-white/80 bg-white/70 text-[#29364d] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#47a8c7] lg:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
            <span className="sr-only">{menuOpen ? "Close tool navigation" : "Open tool navigation"}</span>
          </button>

          <Link href="/" className="flex min-w-0 items-center gap-3">
            <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-white bg-[#fff7f1] shadow-[5px_5px_0_#ff8b7a,0_0_30px_rgba(111,212,255,0.28)]">
              <Image
                src="/devtool-profile.png"
                alt=""
                fill
                sizes="48px"
                className="object-cover"
                priority
              />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-[#172033]">RevyHubX</span>
              <span className="hidden truncate text-xs font-semibold text-[#7a5b45] sm:block">
                Anthropomorphic Stellar helpers
              </span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <label className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[#7dbcd2]/45 bg-white/75 px-3 text-sm font-semibold text-[#29364d] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
            <Network className="h-4 w-4 text-[#178fb5]" aria-hidden />
            <span className="sr-only sm:not-sr-only">Network</span>
            <select
              value={network}
              onChange={(event) => {
                const next = event.target.value;
                if (isStellarNetwork(next)) setNetwork(next);
              }}
              className="bg-transparent text-sm font-extrabold uppercase text-[#172033] outline-none"
              aria-label="Select Stellar network"
            >
              <option className="bg-white" value="testnet">
                Testnet
              </option>
              <option className="bg-white" value="mainnet">
                Mainnet
              </option>
            </select>
          </label>
          <Badge tone={network === "testnet" ? "info" : "warning"} className="hidden sm:inline-flex">
            {network}
          </Badge>
          <a
            href="https://github.com/RevenantLabs/RevyHub"
            className="hidden items-center gap-2 rounded-md border border-[#c7b9f3]/65 bg-white/60 px-3 py-2 text-sm font-semibold text-[#29364d] transition hover:border-[#ff8b7a]/70 hover:bg-[#fff7f1] sm:inline-flex"
          >
            <Github className="h-4 w-4" aria-hidden />
            GitHub
          </a>
        </div>
      </div>

      {menuOpen ? (
        <div
          id="mobile-tool-nav"
          className="max-h-[70vh] overflow-y-auto border-t border-white/70 bg-white/90 lg:hidden"
        >
          <SidebarNav onNavigate={() => setMenuOpen(false)} />
        </div>
      ) : null}
    </header>
  );
}
