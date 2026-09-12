"use client";

import { Card } from "@/core/ui/Card";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useSep12Fields } from "@/features/sep12-fields/hooks/useSep12Fields";
import { errorCopy } from "@/features/sep12-fields/copy";
import { Sep12FieldsForm } from "@/features/sep12-fields/components/Sep12FieldsForm";
import { Sep12FieldsResult } from "@/features/sep12-fields/components/Sep12FieldsResult";
import { Sep12FieldsEmptyState } from "@/features/sep12-fields/components/Sep12FieldsEmptyState";

export function Sep12FieldsPanel() {
  const { state, submit } = useSep12Fields();

  return (
    <div className="space-y-5">
      <Card>
        <Sep12FieldsForm onSubmit={submit} />
      </Card>

      {state.status === "error" ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? <Sep12FieldsResult result={state.result} /> : null}

      {state.status === "idle" ? <Sep12FieldsEmptyState /> : null}
    </div>
  );
}
