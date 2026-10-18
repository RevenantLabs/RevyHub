"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { Input, Textarea } from "@/core/ui/Input";
import { copy } from "@/features/transaction-size-analyzer/copy";
import type { RawSizeInput } from "@/features/transaction-size-analyzer/schema";

export function TransactionSizeAnalyzerForm({
  onSubmit
}: {
  onSubmit: (input: RawSizeInput) => void;
}) {
  const [envelope, setEnvelope] = useState("");
  const [budget, setBudget] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({ envelope, budget });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field label={copy.envelopeLabel} hint={copy.envelopeHint} required>
        {({ inputId, describedBy, invalid, required }) => (
          <Textarea
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            required={required}
            value={envelope}
            onChange={(event) => setEnvelope(event.target.value)}
            placeholder="AAAAAgAAAAA..."
            autoComplete="off"
            spellCheck={false}
            rows={6}
          />
        )}
      </Field>

      <Field label={copy.budgetLabel} hint={copy.budgetHint}>
        {({ inputId, describedBy, invalid }) => (
          <Input
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            value={budget}
            onChange={(event) => setBudget(event.target.value)}
            placeholder="1024"
            inputMode="numeric"
            autoComplete="off"
            spellCheck={false}
          />
        )}
      </Field>

      <Button type="submit">{copy.submit}</Button>
    </form>
  );
}
