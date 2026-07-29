"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useRecentToolsContext } from "@/components/ui/RecentToolsProvider";
import type { ToolStatus } from "@/lib/constants";

interface ToolCardProps {
  title: string;
  description: string;
  character: string;
  href: string;
  status: ToolStatus;
  icon: React.ComponentType<{ className?: string }>;
}

const statusTone: Record<ToolStatus, "success" | "info" | "warning"> = {
  Working: "success",
  MVP: "info",
  "Coming Soon": "warning"
};

export function ToolCard({ title, description, character, href, status, icon: Icon }: ToolCardProps) {
  const router = useRouter();
  const { recordTool } = useRecentToolsContext();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    recordTool(href);
    router.push(href);
  };

  return (
    <a href={href} onClick={handleClick} className="group block">
      {/* TODO(issue #1): Extend tool cards with richer status metadata, grouped categories, and accessible hover/focus states. */}
      <Card className="h-full overflow-hidden transition hover:-translate-y-0.5 hover:border-[#82cbe3]/80 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.82),6px_6px_0_rgba(255,139,122,0.28),0_26px_70px_rgba(84,102,136,0.2)]">
        <div className="flex items-start justify-between gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-lg border border-[#82cbe3]/70 bg-[#e0f6ff] text-[#178fb5] shadow-[5px_5px_0_rgba(255,139,122,0.28)]">
            <Icon className="h-5 w-5" aria-hidden />
          </span>
          <Badge tone={statusTone[status]}>{status}</Badge>
        </div>
        <h3 className="mt-5 text-lg font-semibold text-[#172033]">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-[#5d6b82]">{description}</p>
        <p className="mt-4 rounded-md border border-[#ffd1c6]/80 bg-[#fff7f1] px-3 py-2 text-xs font-semibold leading-5 text-[#8a5a4c]">
          {character}
        </p>
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#178fb5]">
          Meet helper
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
        </span>
      </Card>
    </a>
  );
}
