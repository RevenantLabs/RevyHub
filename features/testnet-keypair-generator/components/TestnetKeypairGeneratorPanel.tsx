"use client";

import { Card } from "@/core/ui/Card";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useTestnetKeypairGenerator } from "@/features/testnet-keypair-generator/hooks/useTestnetKeypairGenerator";
import { errorCopy } from "@/features/testnet-keypair-generator/copy";
import { TestnetKeypairGeneratorForm } from "@/features/testnet-keypair-generator/components/TestnetKeypairGeneratorForm";
import { TestnetKeypairGeneratorResult } from "@/features/testnet-keypair-generator/components/TestnetKeypairGeneratorResult";
import { TestnetKeypairGeneratorEmptyState } from "@/features/testnet-keypair-generator/components/TestnetKeypairGeneratorEmptyState";

export function TestnetKeypairGeneratorPanel() {
  const { state, submit } = useTestnetKeypairGenerator();

  return (
    <div className="space-y-5">
      <Card>
        <TestnetKeypairGeneratorForm
          onSubmit={submit}
          pending={state.status === "loading"}
        />
      </Card>

      {state.status === "error" ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? (
        <TestnetKeypairGeneratorResult result={state.result} />
      ) : null}

      {state.status === "idle" ? <TestnetKeypairGeneratorEmptyState /> : null}
    </div>
  );
}
