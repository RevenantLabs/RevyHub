"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { Input } from "@/core/ui/Input";
import { copy, errorCopy } from "@/features/memo-required-checker/copy";
import type { MemoRequiredCheckerErrorCode, MemoRequiredField } from "@/features/memo-required-checker/types";

export function MemoRequiredCheckerForm({
  onSubmit,
  pending,
  errorField,
  errorCode
}: {
  onSubmit: (values: { accountId: string }) => void;
  pending: boolean;
  errorField: MemoRequiredField | null;
  errorCode: MemoRequiredCheckerErrorCode | null;
}) {
  const [accountId, setAccountId] = useState("");
  const message = errorCode ? errorCopy[errorCode].title : null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({ accountId });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field
        label={copy.accountLabel}
        hint={copy.accountHint}
        error={errorField === "accountId" ? message : null}
      >
        {({ inputId, describedBy, invalid }) => (
          <Input
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            value={accountId}
            onChange={(event) => setAccountId(event.target.value)}
            placeholder="G..."
            autoComplete="off"
            spellCheck={false}
            className="font-mono"
          />
        )}
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? copy.loading : copy.submit}
      </Button>
    </form>
  );
}
