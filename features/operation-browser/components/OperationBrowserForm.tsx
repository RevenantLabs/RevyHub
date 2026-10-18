"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { Input } from "@/core/ui/Input";
import { copy } from "@/features/operation-browser/copy";
import type { OperationBrowserField } from "@/features/operation-browser/types";

export function OperationBrowserForm({
  onSubmit,
  pending,
  errorField,
  errorMessage
}: {
  onSubmit: (accountId: string) => void;
  pending: boolean;
  errorField?: OperationBrowserField | null;
  errorMessage?: string | null;
}) {
  const [accountId, setAccountId] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(accountId);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field
        label={copy.formLabel}
        hint={copy.formHint}
        error={errorField === "accountId" ? errorMessage : null}
      >
        {({ inputId, describedBy, invalid }) => (
          <Input
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            value={accountId}
            onChange={(event) => setAccountId(event.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
        )}
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? copy.loading : copy.submit}
      </Button>
    </form>
  );
}
