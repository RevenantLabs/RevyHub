import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type StatusType = "success" | "error" | "warning" | "info";

export interface StatusMessageProps {
  /** Visual and semantic variant of the message. */
  type: StatusType;
  /** Short headline shown in bold. */
  title: string;
  /** Optional supporting text below the title. */
  description?: string;
  /**
   * Optional interactive content (e.g. a link or button) rendered below the
   * description.  Useful for contextual recovery actions.
   */
  action?: React.ReactNode;
}

const statusStyles: Record<StatusType, string> = {
  success: "border-[#70c7a7]/70 bg-[#e1f8ef] text-[#17664b]",
  error: "border-[#ff9a8b]/75 bg-[#fff0ee] text-[#9f342d]",
  warning: "border-[#ffc3a8]/80 bg-[#fff2e9] text-[#9a513f]",
  info: "border-[#82cbe3]/70 bg-[#e0f6ff] text-[#146783]",
};

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: TriangleAlert,
  info: Info,
};

/**
 * Map each status type to the appropriate ARIA live-region politeness level.
 * Errors and warnings interrupt immediately; info/success are polite.
 */
const ariaLive: Record<StatusType, "assertive" | "polite"> = {
  error: "assertive",
  warning: "assertive",
  success: "polite",
  info: "polite",
};

/**
 * StatusMessage — reusable feedback banner for success, error, warning, and
 * info states across all tool pages.
 *
 * Accessibility:
 * - Wraps content in a `role="status"` region so screen readers announce it.
 * - Uses `aria-live="assertive"` for errors/warnings and `"polite"` for the
 *   rest, ensuring critical feedback is surfaced immediately.
 * - The decorative icon carries `aria-hidden` so the text alone communicates
 *   the message.
 * - Colour contrast meets WCAG 2.1 AA (≥4.5:1) for the chosen palette pairs.
 */
export function StatusMessage({
  type,
  title,
  description,
  action,
}: StatusMessageProps) {
  const Icon = icons[type];

  return (
    <div
      role="status"
      aria-live={ariaLive[type]}
      aria-atomic="true"
      className={cn(
        "flex gap-3 rounded-lg border p-4 shadow-[4px_4px_0_rgba(255,139,122,0.12)]",
        statusStyles[type],
      )}
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/60">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-extrabold">{title}</p>
        {description ? (
          <p className="mt-1 text-sm text-[#4e5c73]">{description}</p>
        ) : null}
        {action ? <div className="mt-3">{action}</div> : null}
      </div>
    </div>
  );
}
