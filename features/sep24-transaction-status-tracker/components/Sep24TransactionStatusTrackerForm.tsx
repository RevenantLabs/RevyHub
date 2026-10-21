"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { Input } from "@/core/ui/Input";
import { copy, errorCopy } from "@/features/sep24-transaction-status-tracker/copy";
import type {
  Sep24Field,
  Sep24TransactionStatusTrackerErrorCode
} from "@/features/sep24-transaction-status-tracker/types";
import { JwtInputWarning } from "@/features/sep24-transaction-status-tracker/components/JwtInputWarning";

export function Sep24TransactionStatusTrackerForm({
  onSubmit,
  pending,
  errorField,
  errorCode
}: {
  onSubmit: (values: { homeDomain: string; transactionId: string; token: string }) => void;
  pending: boolean;
  errorField: Sep24Field | null;
  errorCode: Sep24TransactionStatusTrackerErrorCode | null;
}) {
  const [homeDomain, setHomeDomain] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [token, setToken] = useState("");
  const message = errorCode ? errorCopy[errorCode].title : null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({ homeDomain, transactionId, token });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <JwtInputWarning />
      <Field label={copy.domainLabel} hint={copy.domainHint} error={errorField === "homeDomain" ? message : null}>
        {({ inputId, describedBy, invalid }) => (
          <Input
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            value={homeDomain}
            onChange={(event) => setHomeDomain(event.target.value)}
            placeholder="anchor.example"
            autoComplete="off"
            spellCheck={false}
          />
        )}
      </Field>
      <Field
        label={copy.transactionLabel}
        hint={copy.transactionHint}
        error={errorField === "transactionId" ? message : null}
      >
        {({ inputId, describedBy, invalid }) => (
          <Input
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            value={transactionId}
            onChange={(event) => setTransactionId(event.target.value)}
            autoComplete="off"
            spellCheck={false}
            className="font-mono"
          />
        )}
      </Field>
      <Field label={copy.tokenLabel} hint={copy.tokenHint} error={errorField === "token" ? message : null}>
        {({ inputId, describedBy, invalid }) => (
          <Input
            id={inputId}
            type="password"
            aria-describedby={describedBy}
            aria-invalid={invalid}
            value={token}
            onChange={(event) => setToken(event.target.value)}
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
