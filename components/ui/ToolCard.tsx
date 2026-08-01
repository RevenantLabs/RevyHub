import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import type { ToolStatus, ToolCategory } from "@/lib/constants";
import { toolCategories } from "@/lib/constants";

interface ToolCardProps {
  title: string;
  description: string;
  character: string;
  href: string;
  status: ToolStatus;
  category: ToolCategory;
  icon: React.ComponentType<{ className?: string }>;
}

const statusTone: Record<ToolStatus, "success" | "info" | "warning"> = {
  Working: "success",
  MVP: "info",
  "Coming Soon": "warning"
};

const categoryTone: Record<ToolCategory, string> = {
  validation: "border-[#c7b9f3]/70 bg-[#f1edff] text-[#5b4b8a]",
  balances: "border-[#82cbe3]/70 bg-[#e0f6ff] text-[#146783]",
  network: "border-[#ffc3a8]/80 bg-[#fff0e8] text-[#9a513f]"
};

export function ToolCard({ title, description, character, href, status, category, icon: Icon }: ToolCardProps) {
  return (
    <Link
      href={href}
      className="group block animate-fade-in-up opacity-0 [animation-fill-mode:forwards] focus-visible:outline-none"
    >
      <Card className="h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-[#82cbe3]/80 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.82),8px_8px_0_rgba(255,139,122,0.28),0_26px_70px_rgba(84,102,136,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff8b7a] focus-visible:ring-offset-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-[#82cbe3]/70 bg-[#e0f6ff] text-[#178fb5] shadow-[5px_5px_0_rgba(255,139,122,0.28)] transition-transform duration-300 group-hover:scale-105">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider",
                categoryTone[category]
              )}
            >
              {toolCategories[category].label}
            </span>
          </div>
          <Badge tone={statusTone[status]}>{status}</Badge>
        </div>
        <h3 className="mt-5 text-lg font-semibold text-[#172033] group-hover:text-[#178fb5] transition-colors duration-200">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-[#5d6b82]">{description}</p>
        <div className="mt-4 flex items-start gap-2 rounded-md border border-[#ffd1c6]/80 bg-[#fff7f1] px-3 py-2">
          <span className="mt-0.5 text-xs" aria-hidden>💬</span>
          <p className="text-xs font-semibold leading-5 text-[#8a5a4c]">{character}</p>
        </div>
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#178fb5] transition-all duration-200 group-hover:gap-3">
          Meet helper
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
        </span>
      </Card>
    </Link>
  );
}
