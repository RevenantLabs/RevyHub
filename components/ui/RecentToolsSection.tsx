"use client";

import Link from "next/link";
import {
  BadgeCheck,
  CircleDollarSign,
  Clock,
  Droplets,
  QrCode,
  Search,
  ShieldCheck,
  Trash2,
  WalletCards
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { RecentlyUsedTool } from "@/hooks/useRecentlyUsedTools";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  ShieldCheck,
  CircleDollarSign,
  BadgeCheck,
  QrCode,
  Search,
  WalletCards,
  Droplets
};

interface RecentToolsSectionProps {
  recentTools: RecentlyUsedTool[];
  onClearHistory: () => void;
  className?: string;
}

function formatRelativeTime(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return new Date(timestamp).toLocaleDateString();
}

export function RecentToolsSection({
  recentTools,
  onClearHistory,
  className
}: RecentToolsSectionProps) {
  if (recentTools.length === 0) {
    return null;
  }

  return (
    <Card className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-[#178fb5]" aria-hidden />
          <h3 className="font-semibold text-[#172033]">Recently used</h3>
          <BadgeCheck className="h-4 w-4 text-[#70c7a7]" aria-hidden />
        </div>
        <Button
          variant="ghost"
          onClick={onClearHistory}
          className="text-xs px-2 py-1"
          aria-label="Clear recent tools history"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden />
          Clear
        </Button>
      </div>

      <ul className="space-y-2" aria-label="Recently used tools">
        {recentTools.map((tool) => {
          const Icon = ICON_MAP[tool.iconName] ?? ShieldCheck;

          return (
            <li key={tool.routeId}>
              <Link
                href={tool.routeId}
                className="flex items-center justify-between rounded-md border border-transparent bg-white/50 px-3 py-2 transition hover:border-[#82cbe3]/60 hover:bg-white/80"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-[#178fb5]" aria-hidden />
                  <span className="text-sm font-medium text-[#172033]">{tool.title}</span>
                </div>
                <time
                  dateTime={tool.timestamp}
                  className="text-xs text-[#68758a]"
                >
                  {formatRelativeTime(tool.timestamp)}
                </time>
              </Link>
            </li>
          );
        })}
      </ul>

      <p className="text-xs text-[#68758a]">
        Only tool names and timestamps are stored locally. No wallet addresses or form data.
      </p>
    </Card>
  );
}
