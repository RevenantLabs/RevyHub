"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { errorCopy } from "@/features/manage-data-codec/copy";
import { useManageDataCodec } from "@/features/manage-data-codec/hooks/useManageDataCodec";
import { ManageDataCodecForm } from "@/features/manage-data-codec/components/ManageDataCodecForm";
import { ManageDataCodecResult } from "@/features/manage-data-codec/components/ManageDataCodecResult";
import { ManageDataCodecEmptyState } from "@/features/manage-data-codec/components/ManageDataCodecEmptyState";

export function ManageDataCodecPanel() {
  const { state, submit, reset, redactions } = useManageDataCodec();

  return (
    <div className="space-y-5">
      <Card>
        {/*
          Keying on the redaction counter remounts the form when a secret key
          is refused, which is what actually clears it out of the field.
          Refusing to encode it would otherwise still leave it on screen —
          and this tool's output is meant to go on-chain.
        */}
        <ManageDataCodecForm key={redactions} onSubmit={submit} onReset={reset} />
      </Card>

      {state.status === "loading" ? (
        <Card>
          <SkeletonRows rows={3} />
        </Card>
      ) : null}

      {state.status === "error" ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? <ManageDataCodecResult entry={state.entry} /> : null}

      {state.status === "idle" ? <ManageDataCodecEmptyState /> : null}
    </div>
  );
}
