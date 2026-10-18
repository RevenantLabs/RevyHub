"use client";

import { Card, StatusMessage } from "@/core/ui";
import { copy, errorCopy } from "../copy";
import { useSorobanEventFilterComposer } from "../hooks/useSorobanEventFilterComposer";
import { FilterPreview } from "./FilterPreview";
import { SorobanEventFilterComposerEmptyState } from "./SorobanEventFilterComposerEmptyState";
import { SorobanEventFilterComposerForm } from "./SorobanEventFilterComposerForm";
import { SorobanEventFilterComposerResult } from "./SorobanEventFilterComposerResult";

export function SorobanEventFilterComposerPanel() {
  const { state, submit, reset } = useSorobanEventFilterComposer();
  return (
    <div className="space-y-5">
      <p>{copy.description}</p>
      <Card>
        <SorobanEventFilterComposerForm onSubmit={submit} onEdit={reset} pending={state.status === "loading"} />
      </Card>
      {state.status === "idle" ? <SorobanEventFilterComposerEmptyState /> : null}
      {state.status === "loading" ? <p role="status">{copy.loading}</p> : null}
      {state.status === "error" ? (
        <>
          <StatusMessage type="error" {...errorCopy[state.code]} />
          {state.preview ? <FilterPreview filter={state.preview} /> : null}
        </>
      ) : null}
      {state.status === "success" ? <SorobanEventFilterComposerResult result={state.result} /> : null}
    </div>
  );
}
