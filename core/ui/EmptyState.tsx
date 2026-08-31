import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/core/lib/cn";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-lg border border-dashed border-[#c7d6e8] bg-white/50 p-8 text-center",
        className
      )}
    >
      <span className="grid h-12 w-12 place-items-center rounded-full bg-[#f1edff]">
        <Icon className="h-6 w-6 text-[#5b4b8a]" aria-hidden />
      </span>
      <p className="text-base font-bold text-[#172033]">{title}</p>
      <div className="max-w-md text-sm leading-6 text-[#68758a]">{description}</div>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
