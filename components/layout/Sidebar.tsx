"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react";
import { tools } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      aria-label="Sidebar navigation"
      className="hidden w-72 shrink-0 border-r border-white/75 bg-white/50 backdrop-blur-lg lg:block"
    >
      <nav className="sticky top-16 space-y-2 p-4" aria-label="Tool navigation">
        {/* Dashboard link */}
        <Link
          href="/"
          aria-current={pathname === "/" ? "page" : undefined}
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

        {tools.map((tool) => {
          const Icon = tool.icon;
          const active = pathname === tool.href;

          return (
            <Link
              key={tool.href}
              href={tool.href}
              aria-current={active ? "page" : undefined}
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
      </nav>
    </aside>
  );
}
