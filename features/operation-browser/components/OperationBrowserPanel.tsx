"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useOperationBrowser } from "@/features/operation-browser/hooks/useOperationBrowser";
import { copy, errorCopy } from "@/features/operation-browser/copy";
import { OperationBrowserForm } from "@/features/operation-browser/components/OperationBrowserForm";
import { OperationBrowserResult } from "@/features/operation-browser/components/OperationBrowserResult";
import { OperationBrowserEmptyState } from "@/features/operation-browser/components/OperationBrowserEmptyState";

export function OperationBrowserPanel() {
  const { state, submit, loadOlder, loadNewer, setTypeFilter } = useOperationBrowser();
  const fieldError = state.status === "error" ? state : null;

  return (
    <div className="space-y-5">
      <Card>
        <OperationBrowserForm
          onSubmit={submit}
          pending={state.status === "loading"}
          errorField={fieldError?.field ?? null}
          errorMessage={fieldError ? errorCopy[fieldError.code].title : null}
        />
      </Card>

      {state.status === "loading" ? (
        <Card>
          <p className="sr-only" role="status">
            {copy.loading}
          </p>
          <SkeletonRows rows={4} />
        </Card>
      ) : null}

      {state.status === "error" && !state.field ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? (
        <OperationBrowserResult
          result={state.result}
          paging={state.paging}
          onLoadOlder={loadOlder}
          onLoadNewer={loadNewer}
          onTypeFilterChange={setTypeFilter}
        />
      ) : null}

      {state.status === "idle" ? <OperationBrowserEmptyState /> : null}
    </div>
  );
}
