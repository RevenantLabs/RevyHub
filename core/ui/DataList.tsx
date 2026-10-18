import type { ReactNode } from "react";
import { cn } from "@/core/lib/cn";

export interface DataListItem {
  label: string;
  value: ReactNode;
  /** Renders the value in a monospace face for hashes, keys and XDR. */
  mono?: boolean;
}

export function DataList({ items, className }: { items: DataListItem[]; className?: string }) {
  return (
    <dl className={cn("divide-y divide-[#e3ebf5]", className)}>
      {items.map((item) => (
        <div key={item.label} className="grid gap-1 py-3 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-4">
          <dt className="text-sm font-bold text-[#4e5c73]">{item.label}</dt>
          <dd className={cn("min-w-0 break-words text-sm text-[#172033]", item.mono && "font-mono text-xs")}>
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
