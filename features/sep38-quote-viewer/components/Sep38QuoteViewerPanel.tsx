"use client";

import { Card } from "@/core/ui/Card";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { Sep38QuoteViewerEmptyState } from "@/features/sep38-quote-viewer/components/Sep38QuoteViewerEmptyState";
import { Sep38QuoteViewerForm } from "@/features/sep38-quote-viewer/components/Sep38QuoteViewerForm";
import { Sep38QuoteViewerResult } from "@/features/sep38-quote-viewer/components/Sep38QuoteViewerResult";
import { copy, errorCopy } from "@/features/sep38-quote-viewer/copy";
import { useSep38QuoteViewer } from "@/features/sep38-quote-viewer/hooks/useSep38QuoteViewer";

const FIELD_ERRORS = new Set(["invalid_home_domain", "invalid_asset", "invalid_amount"]);

export function Sep38QuoteViewerPanel() {
  const { state, submit } = useSep38QuoteViewer();
  const fieldError =
    state.status === "error" && state.field && FIELD_ERRORS.has(state.code) ? state.field : undefined;
  const banner = state.status === "error" && !fieldError ? errorCopy[state.code] : null;

  return (
    <div className="min-w-0 space-y-5">
      <Card>
        <Sep38QuoteViewerForm
          onSubmit={submit}
          pending={state.status === "loading"}
          field={fieldError}
        />
      </Card>

      {state.status === "loading" ? (
        <StatusMessage type="info" title={copy.loadingTitle} description={copy.loadingDescription} />
      ) : null}

      {banner ? <StatusMessage type="error" title={banner.title} description={banner.description} /> : null}

      {state.status === "success" ? <Sep38QuoteViewerResult result={state.result} /> : null}

      {state.status === "idle" ? <Sep38QuoteViewerEmptyState /> : null}
    </div>
  );
}
