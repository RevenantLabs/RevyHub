"use client";

import { useState } from "react";
import { Card } from "@/core/ui/Card";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useKeypairGenerator } from "@/features/testnet-keypair-generator/hooks/useKeypairGenerator";
import { copy, errorCopy } from "@/features/testnet-keypair-generator/copy";
import { KeypairGeneratorForm } from "@/features/testnet-keypair-generator/components/KeypairGeneratorForm";
import { KeypairGeneratorResult } from "@/features/testnet-keypair-generator/components/KeypairGeneratorResult";
import { KeypairGeneratorEmptyState } from "@/features/testnet-keypair-generator/components/KeypairGeneratorEmptyState";

export function KeypairGeneratorPanel() {
  const { state, generate, derive } = useKeypairGenerator();
  const [seed, setSeed] = useState("");

  return (
    <div className="space-y-5">
      <Card>
        <KeypairGeneratorForm
          onGenerate={() => { setSeed(""); generate(); }}
          onDerive={(s) => { setSeed(s); derive(s); }}
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
        <KeypairGeneratorResult keypair={state.keypair} />
      ) : null}

      {state.status === "idle" ? <KeypairGeneratorEmptyState /> : null}
    </div>
  );
}
