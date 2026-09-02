"use client";

import { Card } from "@/core/ui/Card";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useScvalCodec } from "@/features/scval-codec/hooks/useScvalCodec";
import { errorCopy } from "@/features/scval-codec/copy";
import { ScvalCodecForm } from "@/features/scval-codec/components/ScvalCodecForm";
import { ScvalCodecResult } from "@/features/scval-codec/components/ScvalCodecResult";
import { ScvalCodecEmptyState } from "@/features/scval-codec/components/ScvalCodecEmptyState";

export function ScvalCodecPanel() {
  const { state, submit } = useScvalCodec();

  return (
    <div className="space-y-5">
      <Card>
        <ScvalCodecForm onSubmit={submit} pending={state.status === "loading"} />
      </Card>

      {state.status === "error" ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? <ScvalCodecResult result={state.result} /> : null}

      {state.status === "idle" ? <ScvalCodecEmptyState /> : null}
    </div>
  );
}
