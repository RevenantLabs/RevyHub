"use client";
import { useState, type FormEvent } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { Input } from "@/core/ui/Input";
import { copy } from "../copy";
export function OperationResultXdrDecoderForm({ onSubmit, pending }: { onSubmit: (value: string) => void; pending: boolean }) {
  const [value, setValue] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); onSubmit(value); }
  return <form onSubmit={submit} className="space-y-4" noValidate>
    <Field label={copy.formLabel} hint={copy.formHint} required>{({ inputId, describedBy, invalid, required }) => <Input id={inputId} aria-describedby={describedBy} aria-invalid={invalid} required={required} value={value} onChange={(event) => setValue(/^S/i.test(event.target.value.trim()) ? "" : event.target.value)} autoComplete="off" spellCheck={false} inputMode="text" />}</Field>
    <Button type="submit" disabled={pending}>{pending ? copy.loading : copy.submit}</Button>
  </form>;
}
