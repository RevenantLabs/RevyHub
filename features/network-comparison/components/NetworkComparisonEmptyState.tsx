"use client";

import { GitCompare } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/network-comparison/copy";

/**
 * Pre-interaction empty state for the network comparison tool.
 *
 * @returns Rendered empty state component.
 */
export function NetworkComparisonEmptyState() {
  return (
    <EmptyState
      icon={GitCompare}
      title={copy.emptyTitle}
      description={copy.emptyDescription}
    />
  );
}
