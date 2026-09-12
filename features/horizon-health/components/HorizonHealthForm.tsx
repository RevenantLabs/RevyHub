"use client";

import { Button } from "@/core/ui/Button";
import { useNetwork } from "@/core/network/NetworkProvider";
import { HORIZON_URLS } from "@/core/network/config";
import { copy } from "@/features/horizon-health/copy";

/** Action form triggering endpoint diagnostic execution. */
export function HorizonHealthForm({
  onLoad,
  pending,
  loaded
}: {
  onLoad: () => void;
  pending: boolean;
  loaded: boolean;
}) {
  const { network, label } = useNetwork();
  const endpointUrl = HORIZON_URLS[network];

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-[#172033]">
          {copy.readingNetwork} {label}
        </p>
        <p className="font-mono text-xs text-[#68758a]">{endpointUrl}</p>
      </div>
      <Button type="button" onClick={onLoad} disabled={pending}>
        {pending ? copy.loading : loaded ? copy.refresh : copy.submit}
      </Button>
    </div>
  );
}
