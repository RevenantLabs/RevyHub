import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/core/lib/cn";

export type StatusType = "success" | "error" | "warning" | "info";

export interface StatusMessageProps {
  type: StatusType;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

const styles: Record<StatusType, string> = {
  success: "border-[#70c7a7]/70 bg-[#e1f8ef] text-[#17664b]",
  error: "border-[#ff9a8b]/75 bg-[#fff0ee] text-[#9f342d]",
  warning: "border-[#ffc3a8]/80 bg-[#fff2e9] text-[#9a513f]",
  info: "border-[#82cbe3]/70 bg-[#e0f6ff] text-[#146783]"
};

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: TriangleAlert,
  info: Info
} as const;

/**
 * Announces asynchronous outcomes to assistive technology.
 *
 * Errors use `role="alert"` (assertive); everything else uses a polite status
 * region, so a stream of successes never interrupts a screen-reader user.
 */
export function StatusMessage({
  type,
  title,
  description,
  action,
  className
}: StatusMessageProps) {
  const Icon = icons[type];
  const isError = type === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      className={cn(
        "flex gap-3 rounded-lg border p-4 shadow-[4px_4px_0_rgba(255,139,122,0.12)]",
        styles[type],
        className
      )}
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/60">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-extrabold">{title}</p>
        {description ? <div className="mt-1 text-sm text-[#4e5c73]">{description}</div> : null}
        {action ? <div className="mt-3">{action}</div> : null}
      </div>
    </div>
  );
}
