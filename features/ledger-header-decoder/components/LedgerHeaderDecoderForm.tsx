"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { Textarea } from "@/core/ui/Input";
import { copy } from "@/features/ledger-header-decoder/copy";

export function LedgerHeaderDecoderForm({ onSubmit, pending }: { onSubmit: (value: string) => void; pending: boolean }) {
  const [value, setValue] = useState("");
  function handleSubmit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); onSubmit(value); }
  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field label={copy.formLabel} hint={copy.formHint} required>
        {({ inputId, describedBy, invalid, required }) => (
          <Textarea id={inputId} aria-describedby={describedBy} aria-invalid={invalid} required={required}
            value={value} onChange={(event) => {
              const next = event.target.value;
              if (next.trimStart().startsWith("S")) {
                setValue("");
                onSubmit("S");
              } else {
                setValue(next);
              }
            }}
            placeholder={copy.placeholder} autoComplete="off" spellCheck={false} rows={6} />
        )}
      </Field>
      <Button type="submit" disabled={pending}>{pending ? copy.loading : copy.submit}</Button>
    </form>
  );
}
