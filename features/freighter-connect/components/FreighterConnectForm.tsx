"use client";

import { Button } from "@/core/ui/Button";
import { copy } from "@/features/freighter-connect/copy";

/**
 * This tool has no text input — its "form" is the pair of actions that read or
 * request access to the wallet. It stays a separate component so the slice
 * keeps one place where user intent enters the feature.
 */
export function FreighterConnectForm({
  pending,
  canConnect,
  onRefresh,
  onConnect
}: {
  pending: boolean;
  canConnect: boolean;
  onRefresh: () => void;
  onConnect: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {canConnect ? (
        <Button type="button" onClick={onConnect} disabled={pending}>
          {pending ? copy.checking : copy.connect}
        </Button>
      ) : null}

      <Button type="button" variant="secondary" onClick={onRefresh} disabled={pending}>
        {pending ? copy.checking : copy.refresh}
      </Button>
    </div>
  );
}
