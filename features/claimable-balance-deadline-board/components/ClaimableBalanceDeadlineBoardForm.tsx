"use client";
import { useState, type FormEvent } from "react";
import { Field } from "@/core/ui/Field";
import { Input } from "@/core/ui/Input";
import { Button } from "@/core/ui/Button";
import { copy } from "../copy";
export function ClaimableBalanceDeadlineBoardForm({ onSubmit, pending, errorField, errorMessage }: {
  onSubmit: (value: { claimant: string; cursor?: string }) => void;
  pending: boolean; errorField: "claimant" | "cursor" | null; errorMessage: string | null;
}) {
  const [claimant, setClaimant] = useState("");
  const [cursor, setCursor] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({ claimant, cursor });
  }
  return <form onSubmit={submit} noValidate className="space-y-4">
    <Field label={copy.claimantLabel} hint={copy.claimantHint} error={errorField === "claimant" ? errorMessage : null} required>
      {({ inputId, describedBy, invalid, required }) => <Input id={inputId} aria-describedby={describedBy} aria-invalid={invalid} required={required} value={claimant} onChange={(event) => setClaimant(event.target.value.trimStart().startsWith("S") ? "" : event.target.value)} autoComplete="off" spellCheck={false} className="font-mono text-xs" />}
    </Field>
    <Field label={copy.cursorLabel} hint={copy.cursorHint} error={errorField === "cursor" ? errorMessage : null}>
      {({ inputId, describedBy, invalid }) => <Input id={inputId} aria-describedby={describedBy} aria-invalid={invalid} value={cursor} onChange={(event) => setCursor(event.target.value.trimStart().startsWith("S") ? "" : event.target.value)} autoComplete="off" spellCheck={false} className="font-mono text-xs" />}
    </Field>
    <Button type="submit" disabled={pending}>{pending ? copy.loading : copy.submit}</Button>
  </form>;
}
