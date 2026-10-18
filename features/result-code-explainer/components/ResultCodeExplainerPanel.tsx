"use client";

import { useState } from "react";
import { Card } from "@/core/ui/Card";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useResultCodeExplainer } from "@/features/result-code-explainer/hooks/useResultCodeExplainer";
import { errorCopy } from "@/features/result-code-explainer/copy";
import { ResultCodeExplainerForm } from "@/features/result-code-explainer/components/ResultCodeExplainerForm";
import { ResultCodeExplainerResult } from "@/features/result-code-explainer/components/ResultCodeExplainerResult";
import { ResultCodeExplainerEmptyState } from "@/features/result-code-explainer/components/ResultCodeExplainerEmptyState";

export function ResultCodeExplainerPanel() {
  const { state, submit } = useResultCodeExplainer();
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-5">
      <Card>
        <ResultCodeExplainerForm
          onSubmit={submit}
          search={search}
          onSearchChange={setSearch}
        />
      </Card>

      {state.status === "error" ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? <ResultCodeExplainerResult result={state.result} /> : null}

      {state.status === "idle" ? <ResultCodeExplainerEmptyState /> : null}
    </div>
  );
}
