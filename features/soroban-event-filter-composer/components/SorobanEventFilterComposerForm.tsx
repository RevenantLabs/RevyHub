"use client";

import { useState } from "react";
import { Button, Field, Input } from "@/core/ui";
import { copy } from "../copy";
import { containsSecret } from "../schema";
import type { RawInput } from "../types";

const defaults: RawInput = {
  contractIds: "",
  eventType: "All",
  topics: "",
  startLedger: "",
  limit: "",
  cursor: ""
};

export function SorobanEventFilterComposerForm({
  onSubmit,
  onEdit,
  pending
}: {
  onSubmit: (raw: RawInput) => void;
  onEdit: () => void;
  pending: boolean;
}) {
  const [values, setValues] = useState<RawInput>(defaults);
  const [rejected, setRejected] = useState(false);

  function change(key: string, value: string) {
    onEdit();
    if (containsSecret(value)) {
      setValues((current) => ({ ...current, [key]: "" }));
      setRejected(true);
      return;
    }
    setRejected(false);
    setValues((current) => ({ ...current, [key]: value }));
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(values);
      }}
    >
      {Object.entries(copy.fields).map(([key, spec]) => (
        <Field key={key} label={spec.label} hint={"hint" in spec ? spec.hint : undefined}>
          {({ inputId, describedBy }) => {
            const field = spec as { options?: readonly string[]; multiline?: boolean };
            if (field.options) {
              return (
                <select id={inputId} aria-describedby={describedBy} value={values[key]} onChange={(event) => change(key, event.target.value)} className="w-full rounded border p-2">
                  {field.options.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              );
            }
            if (field.multiline) {
              return (
                <textarea id={inputId} aria-describedby={describedBy} value={values[key]} onChange={(event) => change(key, event.target.value)} rows={4} autoComplete="off" spellCheck={false} className="w-full rounded border p-2 font-mono" />
              );
            }
            return <Input id={inputId} aria-describedby={describedBy} value={values[key]} onChange={(event) => change(key, event.target.value)} autoComplete="off" spellCheck={false} />;
          }}
        </Field>
      ))}
      {rejected ? <p role="alert">{copy.rejected}</p> : null}
      <Button type="submit" disabled={pending}>{pending ? copy.loading : copy.submit}</Button>
      <Button type="button" variant="secondary" onClick={() => { setValues(defaults); setRejected(false); onEdit(); }}>{copy.reset}</Button>
    </form>
  );
}
