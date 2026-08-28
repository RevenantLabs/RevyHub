"use client";

import { Button } from "@/core/ui/Button";
import { useNetwork } from "@/core/network/NetworkProvider";
import { copy } from "@/features/fee-stats/copy";

/**
 * This tool takes no input — the only user intent is "read the current
 * network". It stays a separate component so the slice keeps one place where
 * intent enters the feature.
 */
export function FeeStatsForm({
  onLoad,
  pending,
  loaded
}: {
  onLoad: () => void;
  pending: boolean;
  loaded: boolean;
}) {
  const { label } = useNetwork();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button type="button" onClick={onLoad} disabled={pending}>
        {pending ? copy.loading : loaded ? copy.refresh : copy.submit}
      </Button>
      <p className="text-sm text-[#68758a]">Reading {label}.</p>
    </div>
  );
}
