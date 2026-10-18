"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { copy } from "@/features/soroban-footprint-diff/copy";
import type { RawSorobanFootprintDiffForm } from "@/features/soroban-footprint-diff/schema";

export function SorobanFootprintDiffForm({
  onSubmit,
  pending
}: {
  onSubmit: (values: RawSorobanFootprintDiffForm) => void;
  pending: boolean;
}) {
  const [firstResult, setFirstResult] = useState("");
  const [secondResult, setSecondResult] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({ firstResult, secondResult });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <p className="text-sm text-[#68758a]">{copy.formHint}</p>
      <Field label={copy.firstLabel} required>
        {({ inputId, describedBy, invalid, required }) => (
          <textarea
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            required={required}
            value={firstResult}
            onChange={(event) => setFirstResult(event.target.value)}
            rows={8}
            className="w-full rounded-md border border-[#c7d6e8] bg-white/80 p-3 font-mono text-xs text-[#172033]"
          />
        )}
      </Field>
      <Field label={copy.secondLabel} required>
        {({ inputId, describedBy, invalid, required }) => (
          <textarea
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            required={required}
            value={secondResult}
            onChange={(event) => setSecondResult(event.target.value)}
            rows={8}
            className="w-full rounded-md border border-[#c7d6e8] bg-white/80 p-3 font-mono text-xs text-[#172033]"
          />
        )}
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? copy.loading : copy.submit}
      </Button>
    </form>
  );
}
