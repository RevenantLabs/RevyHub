"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { errorCopy } from "@/features/operation-source-map/copy";
import { useOperationSourceMap } from "@/features/operation-source-map/hooks/useOperationSourceMap";
import { OperationSourceMapForm } from "@/features/operation-source-map/components/OperationSourceMapForm";
import { OperationSourceMapResult } from "@/features/operation-source-map/components/OperationSourceMapResult";
import { OperationSourceMapEmptyState } from "@/features/operation-source-map/components/OperationSourceMapEmptyState";
import { isUnsupportedEnvelope } from "@/features/operation-source-map/lib/operationSourceMap.errors";

export function OperationSourceMapPanel() {
  const { state, filter, setFilter, visibleOperations, resetFilter, submit, redactions } =
    useOperationSourceMap();

  return (
    <div className="space-y-5">
      <Card>
        {/*
          Keying on the redaction counter remounts the form when a secret key
          is refused, which is what actually clears the seed out of the
          textarea. Refusing to decode it would otherwise still leave it on
          screen in plain text.
        */}
        <OperationSourceMapForm key={redactions} onSubmit={submit} />
      </Card>

      {state.status === "loading" ? (
        <Card>
          <SkeletonRows rows={4} />
        </Card>
      ) : null}

      {state.status === "error" ? (
        <StatusMessage
          // A real envelope this tool cannot map is a scope limit, not a
          // broken paste, so it is announced as information.
          type={isUnsupportedEnvelope(state.code) ? "info" : "error"}
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? (
        <OperationSourceMapResult
          map={state.map}
          filter={filter}
          onFilterChange={setFilter}
          onResetFilter={resetFilter}
          visibleOperations={visibleOperations}
        />
      ) : null}

      {state.status === "idle" ? <OperationSourceMapEmptyState /> : null}
    </div>
  );
}
