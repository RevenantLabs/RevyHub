"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { manifestsByCategory, featureHref } from "@/core/registry/manifests";
import { FEATURE_CATEGORY_LABELS } from "@/core/registry/types";
import { cn } from "@/core/lib/cn";

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const groups = manifestsByCategory();

  return (
    <nav aria-label="Tools" className="space-y-5 p-4">
      {groups.map((group) => (
        <div key={group.category} className="space-y-1">
          <p className="px-3 text-xs font-extrabold uppercase tracking-wide text-[#9a6754]">
            {FEATURE_CATEGORY_LABELS[group.category]}
          </p>
          {group.entries.map((manifest) => {
            const Icon = manifest.icon;
            const href = featureHref(manifest.slug);
            const active = pathname === href;

            return (
              <Link
                key={manifest.slug}
                href={href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-[1rem] px-3 py-2.5 text-sm font-semibold transition",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#47a8c7]",
                  active
                    ? "bg-[#fff7f1] text-[#172033] shadow-[4px_4px_0_#ff8b7a,0_0_26px_rgba(111,212,255,0.18)]"
                    : "border border-transparent text-[#4e5c73] hover:border-white/80 hover:bg-white/64 hover:text-[#172033]"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                <span className="min-w-0 truncate">{manifest.title}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-white/75 bg-white/50 backdrop-blur-lg lg:block">
      <div className="sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto">
        <SidebarNav />
      </div>
    </aside>
  );
}
