"use client";

import { useState } from "react";
import { Button, Field } from "@/core/ui";
import { copy } from "../copy";
import type { RawInput } from "../types";

const defaults: RawInput = { uri: "", policy: "" };
const secret = /^S[A-Z2-7]{55}$/;

export function Sep7RequestPolicyAuditorForm({ onSubmit, onEdit, pending }: { onSubmit: (raw: RawInput) => void; onEdit: () => void; pending: boolean }) {
  const [values, setValues] = useState<RawInput>(defaults);
  const [rejected, setRejected] = useState(false);

  function change(key: string, value: string) {
    onEdit();
    if (value.split(/[\s?&]/).some((part) => secret.test(part.trim()))) {
      setValues((current) => ({ ...current, [key]: "" }));
      setRejected(true);
      return;
    }
    setRejected(false);
    setValues((current) => ({ ...current, [key]: value }));
  }

  return (
    <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); onSubmit(values); }}>
      {Object.entries(copy.fields).map(([key, spec]) => (
        <Field key={key} label={spec.label} hint={spec.hint}>
          {({ inputId, describedBy }) => (
            <textarea id={inputId} aria-describedby={describedBy} value={values[key]} onChange={(event) => change(key, event.target.value)} rows={4} autoComplete="off" spellCheck={false} className="w-full rounded border p-2 font-mono" />
          )}
        </Field>
      ))}
      {rejected ? <p role="alert">{copy.rejected}</p> : null}
      <Button type="submit" disabled={pending}>{pending ? copy.loading : copy.submit}</Button>
      <Button type="button" variant="secondary" onClick={() => { setValues(defaults); setRejected(false); onEdit(); }}>{copy.reset}</Button>
    </form>
  );
}
