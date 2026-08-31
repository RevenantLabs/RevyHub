"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useNetwork } from "@/core/network/NetworkProvider";
import { useTestnetFaucet } from "@/features/testnet-faucet/hooks/useTestnetFaucet";
import { copy, errorCopy } from "@/features/testnet-faucet/copy";
import { TestnetFaucetForm } from "@/features/testnet-faucet/components/TestnetFaucetForm";
import { TestnetFaucetResult } from "@/features/testnet-faucet/components/TestnetFaucetResult";
import { TestnetFaucetEmptyState } from "@/features/testnet-faucet/components/TestnetFaucetEmptyState";

export function TestnetFaucetPanel() {
  const { state, submit } = useTestnetFaucet();
  const { network } = useNetwork();

  return (
    <div className="space-y-5">
      {network !== "testnet" ? (
        <StatusMessage type="warning" title={copy.mainnetWarning} />
      ) : null}

      <Card>
        <TestnetFaucetForm onSubmit={submit} pending={state.status === "funding"} />
      </Card>

      {state.status === "funding" ? (
        <Card>
          <p className="sr-only" role="status">
            {copy.loading}
          </p>
          <SkeletonRows rows={2} />
        </Card>
      ) : null}

      {state.status === "error" ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? <TestnetFaucetResult result={state.result} /> : null}

      {state.status === "idle" ? <TestnetFaucetEmptyState /> : null}
    </div>
  );
}
