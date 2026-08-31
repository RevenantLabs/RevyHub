"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useMultisigAnalyzer } from "@/features/multisig-analyzer/hooks/useMultisigAnalyzer";
import { errorCopy } from "@/features/multisig-analyzer/copy";
import { MultisigAnalyzerForm } from "@/features/multisig-analyzer/components/MultisigAnalyzerForm";
import { MultisigAnalyzerResult } from "@/features/multisig-analyzer/components/MultisigAnalyzerResult";
import { MultisigAnalyzerEmptyState } from "@/features/multisig-analyzer/components/MultisigAnalyzerEmptyState";

export function MultisigAnalyzerPanel() {
  const { state, submit } = useMultisigAnalyzer();

  return (
    <div className="space-y-5">
      <Card>
        <MultisigAnalyzerForm onSubmit={submit} pending={state.status === "loading"} />
      </Card>

      {state.status === "loading" ? (
        <Card>
          <p className="sr-only" role="status">
            Analyzing transaction...
          </p>
          <SkeletonRows rows={4} />
        </Card>
      ) : null}

      {state.status === "error" ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? <MultisigAnalyzerResult result={state.result} /> : null}

      {state.status === "idle" ? <MultisigAnalyzerEmptyState /> : null}
    </div>
  );
}
