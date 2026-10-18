"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { errorCopy } from "@/features/fee-bump-inspector/copy";
import { useFeeBumpInspector } from "@/features/fee-bump-inspector/hooks/useFeeBumpInspector";
import { FeeBumpInspectorForm } from "@/features/fee-bump-inspector/components/FeeBumpInspectorForm";
import { FeeBumpInspectorResult } from "@/features/fee-bump-inspector/components/FeeBumpInspectorResult";
import { FeeBumpInspectorEmptyState } from "@/features/fee-bump-inspector/components/FeeBumpInspectorEmptyState";
import { isWrongEnvelopeKind } from "@/features/fee-bump-inspector/lib/feeBumpInspector.errors";

export function FeeBumpInspectorPanel() {
  const { state, submit, redactions } = useFeeBumpInspector();

  return (
    <div className="space-y-5">
      <Card>
        {/*
          Keying on the redaction counter remounts the form when a secret key
          is refused, which is what actually clears the seed out of the
          textarea. Refusing to decode it would otherwise still leave it
          sitting on screen in plain text.
        */}
        <FeeBumpInspectorForm key={redactions} onSubmit={submit} />
      </Card>

      {state.status === "loading" ? (
        <Card>
          <SkeletonRows rows={4} />
        </Card>
      ) : null}

      {state.status === "error" ? (
        <StatusMessage
          // An ordinary envelope is a usable envelope in the wrong tool, not a
          // failure, so it is announced as information rather than an error.
          type={isWrongEnvelopeKind(state.code) ? "info" : "error"}
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? <FeeBumpInspectorResult report={state.report} /> : null}

      {state.status === "idle" ? <FeeBumpInspectorEmptyState /> : null}
    </div>
  );
}
