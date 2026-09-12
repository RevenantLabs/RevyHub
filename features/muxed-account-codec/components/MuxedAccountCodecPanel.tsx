"use client";

import { Card } from "@/core/ui/Card";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useMuxedAccountCodec } from "@/features/muxed-account-codec/hooks/useMuxedAccountCodec";
import { copy, errorCopy } from "@/features/muxed-account-codec/copy";
import { MuxedAccountCodecForm } from "@/features/muxed-account-codec/components/MuxedAccountCodecForm";
import { MuxedAccountCodecResult } from "@/features/muxed-account-codec/components/MuxedAccountCodecResult";
import { MuxedAccountCodecEmptyState } from "@/features/muxed-account-codec/components/MuxedAccountCodecEmptyState";

export function MuxedAccountCodecPanel() {
  const { state, submit, reset } = useMuxedAccountCodec();

  return (
    <div className="space-y-5">
      <Card>
        <MuxedAccountCodecForm onSubmit={submit} onReset={reset} />
      </Card>

      {state.status === "loading" ? (
        <StatusMessage type="info" title={copy.loadingMessage} />
      ) : null}

      {state.status === "error" ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? <MuxedAccountCodecResult result={state.result} /> : null}

      {state.status === "idle" ? <MuxedAccountCodecEmptyState /> : null}
    </div>
  );
}
