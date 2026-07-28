"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Github, Home, Menu, Network, X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useNetwork } from "@/components/stellar/NetworkProvider";
import { tools } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function AppHeader() {
  const { network, setNetwork } = useNetwork();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close mobile menu on route change (deferred to avoid setState-in-effect lint error)
  useEffect(() => {
    const id = setTimeout(() => setIsMobileOpen(false), 0);
    return () => clearTimeout(id);
  }, [pathname]);

  // Close on Escape key
  useEffect(() => {
    if (!isMobileOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isMobileOpen]);

  // Lock body scroll while mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  return (
    <>
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
                onChange={(event) => setNetwork(event.target.value === "mainnet" ? "mainnet" : "testnet")}
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
            <Badge tone={network === "testnet" ? "info" : "warning"}>{network}</Badge>
            <a
              href="https://github.com/RevenantLabs/RevyHubX"
              className="hidden items-center gap-2 rounded-md border border-[#c7b9f3]/65 bg-white/60 px-3 py-2 text-sm font-semibold text-[#29364d] transition hover:border-[#ff8b7a]/70 hover:bg-[#fff7f1] sm:inline-flex"
            >
              <Github className="h-4 w-4" aria-hidden />
              GitHub
            </a>

            {/* Mobile menu toggle — hidden on desktop */}
            <button
              type="button"
              aria-label={isMobileOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMobileOpen}
              aria-controls="mobile-nav-drawer"
              onClick={() => setIsMobileOpen((prev) => !prev)}
              className="inline-flex items-center justify-center rounded-md border border-white/70 bg-white/60 p-2 text-[#29364d] transition hover:border-[#ff8b7a]/60 hover:bg-[#fff7f1] lg:hidden"
            >
              {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile navigation drawer */}
      {isMobileOpen && (
        <>
          {/* Backdrop */}
          <div
            aria-hidden="true"
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />

          {/* Drawer panel */}
          <div
            id="mobile-nav-drawer"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/70 bg-white/90 shadow-[8px_0_40px_rgba(80,95,130,0.18)] backdrop-blur-xl lg:hidden"
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between border-b border-white/70 px-4 py-3">
              <Link
                href="/"
                className="flex items-center gap-3"
                onClick={() => setIsMobileOpen(false)}
              >
                <span className="relative h-10 w-10 overflow-hidden rounded-lg border border-white bg-[#fff7f1] shadow-[4px_4px_0_#ff8b7a]">
                  <Image
                    src="/devtool-profile.png"
                    alt="RevyHubX profile character"
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-[#172033]">RevyHubX</span>
                  <span className="block text-xs font-semibold text-[#7a5b45]">Helper cast</span>
                </span>
              </Link>
              <button
                type="button"
                aria-label="Close navigation menu"
                onClick={() => setIsMobileOpen(false)}
                className="rounded-md border border-white/70 bg-white/60 p-1.5 text-[#4e5c73] transition hover:border-[#ff8b7a]/60 hover:bg-[#fff7f1]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Drawer navigation links */}
            <nav className="flex-1 overflow-y-auto p-4" aria-label="Mobile tool navigation">
              {/* Dashboard */}
              <Link
                href="/"
                aria-current={pathname === "/" ? "page" : undefined}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-[1rem] px-3 py-2.5 text-sm font-semibold transition",
                  pathname === "/"
                    ? "bg-[#fff7f1] text-[#172033] shadow-[4px_4px_0_#ff8b7a,0_0_26px_rgba(111,212,255,0.18)]"
                    : "border border-transparent text-[#4e5c73] hover:border-white/80 hover:bg-white/64 hover:text-[#172033]"
                )}
              >
                <Home className="h-4 w-4" aria-hidden />
                Dashboard
              </Link>

              <p className="mt-4 px-3 text-xs font-extrabold uppercase tracking-wide text-[#9a6754]">
                Helper cast
              </p>

              <div className="mt-2 space-y-1">
                {tools.map((tool) => {
                  const Icon = tool.icon;
                  const active = pathname === tool.href;
                  return (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-[1rem] px-3 py-2.5 text-sm font-semibold transition",
                        active
                          ? "bg-[#fff7f1] text-[#172033] shadow-[4px_4px_0_#ff8b7a,0_0_26px_rgba(111,212,255,0.18)]"
                          : "border border-transparent text-[#4e5c73] hover:border-white/80 hover:bg-white/64 hover:text-[#172033]"
                      )}
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                      {tool.title}
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* Drawer footer */}
            <div className="border-t border-white/70 px-4 py-3">
              <a
                href="https://github.com/RevenantLabs/RevyHubX"
                className="flex items-center gap-2 rounded-md border border-[#c7b9f3]/65 bg-white/60 px-3 py-2 text-sm font-semibold text-[#29364d] transition hover:border-[#ff8b7a]/70 hover:bg-[#fff7f1]"
              >
                <Github className="h-4 w-4" aria-hidden />
                GitHub
              </a>
            </div>
          </div>
        </>
      )}
    </>
  );
}
