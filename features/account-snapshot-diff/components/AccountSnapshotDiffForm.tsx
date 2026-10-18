"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { Textarea } from "@/core/ui/Input";
import { copy } from "@/features/account-snapshot-diff/copy";
import type { SnapshotInput } from "@/features/account-snapshot-diff/types";

export function AccountSnapshotDiffForm({
  onSubmit
}: {
  onSubmit: (input: SnapshotInput) => void;
}) {
  const [before, setBefore] = useState("");
  const [after, setAfter] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({ before, after });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field label={copy.beforeLabel} hint={copy.beforeHint} required>
        {({ inputId, describedBy, invalid, required }) => (
          <Textarea
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            required={required}
            value={before}
            onChange={(event) => setBefore(event.target.value)}
            placeholder={'{ "account_id": "GA…", "balances": [] }'}
            autoComplete="off"
            spellCheck={false}
            rows={6}
          />
        )}
      </Field>

      <Field label={copy.afterLabel} hint={copy.afterHint} required>
        {({ inputId, describedBy, invalid, required }) => (
          <Textarea
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            required={required}
            value={after}
            onChange={(event) => setAfter(event.target.value)}
            placeholder={'{ "account_id": "GA…", "balances": [] }'}
            autoComplete="off"
            spellCheck={false}
            rows={6}
          />
        )}
      </Field>

      <Button type="submit">{copy.submit}</Button>
    </form>
  );
}
