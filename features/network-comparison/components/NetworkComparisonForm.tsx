"use client";

import { Button } from "@/core/ui/Button";
import { copy } from "@/features/network-comparison/copy";

export interface NetworkComparisonFormProps {
  onLoad: () => void;
  pending: boolean;
  loaded: boolean;
}

/**
 * Form control that triggers concurrent network comparison queries.
 *
 * @param props - Component properties.
 * @returns Rendered form control.
 */
export function NetworkComparisonForm({
  onLoad,
  pending,
  loaded
}: NetworkComparisonFormProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" onClick={onLoad} disabled={pending}>
          {pending ? copy.loading : loaded ? copy.refresh : copy.submit}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">{copy.networkSwitchNotice}</p>
    </div>
  );
}
