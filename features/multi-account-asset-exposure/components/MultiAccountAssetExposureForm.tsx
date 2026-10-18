"use client";
import { useState, type FormEvent } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { Textarea } from "@/core/ui/Input";
import { copy } from "../copy";
export function MultiAccountAssetExposureForm({ onSubmit, pending }: {
  onSubmit: (raw: string) => void; pending: boolean;
}) {
  const [value, setValue] = useState("");
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(value);
  }
  return <form onSubmit={handleSubmit} className="space-y-4" noValidate>
    <Field label={copy.formLabel} hint={copy.formHint}>
      {({ inputId, describedBy }) => <Textarea id={inputId} aria-describedby={describedBy}
        value={value} onChange={(event) => {
          const raw = event.target.value;
          if (raw.split(/[\s,]+/).some((token) => /^s/i.test(token))) {
            setValue("");
            onSubmit(raw);
          } else {
            setValue(raw);
          }
        }} autoComplete="off" spellCheck={false} className="font-mono" />}
    </Field>
    <Button type="submit" disabled={pending}>{pending ? copy.loading : copy.submit}</Button>
  </form>;
}
