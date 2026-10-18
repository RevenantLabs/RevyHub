"use client";
import { useState, type FormEvent } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { Input } from "@/core/ui/Input";
import { copy, errorCopy } from "@/features/muxed-payment-routing-audit/copy";
export function MuxedPaymentRoutingAuditForm({ onSubmit, pending, invalid }: { onSubmit: (raw: string) => void; pending: boolean; invalid: boolean }) {
  const [value, setValue] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!value.startsWith("G")) setValue(""); onSubmit(value); }
  return <form onSubmit={submit} noValidate className="space-y-4">
    <Field label={copy.formLabel} hint={copy.formHint} error={invalid ? errorCopy.invalid_account.description : null} required>
      {({ inputId, describedBy, invalid: fieldInvalid, required }) => <Input id={inputId} aria-describedby={describedBy} aria-invalid={fieldInvalid} required={required} value={value} onChange={(event) => setValue(event.target.value.startsWith("S") ? "" : event.target.value)} autoComplete="off" spellCheck={false} className="font-mono" />}
    </Field>
    <Button type="submit" disabled={pending}>{pending ? copy.loading : copy.submit}</Button>
  </form>;
}
