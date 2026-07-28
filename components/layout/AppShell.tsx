"use client";

import { useCallback, useEffect, useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { NetworkProvider } from "@/components/stellar/NetworkProvider";
import { CommandPalette } from "@/components/ui/CommandPalette";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [paletteOpen, setPaletteOpen] = useState(false);

  const handleClose = useCallback(() => setPaletteOpen(false), []);
  const handleToggle = useCallback(() => setPaletteOpen((prev) => !prev), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        const target = e.target as HTMLElement;
        const tag = target.tagName;
        const isEditable =
          tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
        if (!isEditable) {
          e.preventDefault();
          setPaletteOpen((prev) => !prev);
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <NetworkProvider>
      <div className="min-h-screen bg-[linear-gradient(180deg,rgba(255,255,255,0.58),transparent_22rem)]">
        <AppHeader onCommandPaletteToggle={handleToggle} />
        <div className="mx-auto flex max-w-7xl border-x border-white/70 bg-white/32 shadow-[0_24px_90px_rgba(80,95,130,0.16)] backdrop-blur-sm">
          <Sidebar />
          <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-8">
            <div className="relative">
              <div className="pointer-events-none absolute -left-4 -right-4 top-0 h-px bg-gradient-to-r from-transparent via-[#ff8b7a]/55 to-transparent" />
              {children}
            </div>
          </main>
        </div>
      </div>
      <CommandPalette key={String(paletteOpen)} open={paletteOpen} onClose={handleClose} />
    </NetworkProvider>
  );
}
