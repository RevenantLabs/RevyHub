"use client";

import { useMemo, useState } from "react";
import { Button, Field, Input } from "@/core/ui";
import { copy } from "../copy";
import { parseSpec } from "../lib/spec-parser";
import type { RawInput } from "../types";
import { FunctionPicker } from "./FunctionPicker";

const defaults: RawInput = { spec: "", functionName: "", arguments: "" };
const secret = /^S[A-Z2-7]{55}$/;

export function ContractCallArgumentCheckerForm({ onSubmit, onEdit, pending }: { onSubmit: (raw: RawInput) => void; onEdit: () => void; pending: boolean }) {
  const [values, setValues] = useState<RawInput>(defaults);
  const [rejected, setRejected] = useState(false);
  const names = useMemo(() => {
    const parsed = parseSpec(values.spec ?? "");
    return parsed.ok ? parsed.value.functions.map((fn) => fn.name) : [];
  }, [values.spec]);

  function change(key: string, value: string) {
    onEdit();
    if (secret.test(value.trim())) {
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
          {({ inputId, describedBy }) => "multiline" in spec && spec.multiline
            ? <textarea id={inputId} aria-describedby={describedBy} value={values[key]} onChange={(event) => change(key, event.target.value)} rows={5} autoComplete="off" spellCheck={false} className="w-full rounded border p-2 font-mono" />
            : <Input id={inputId} aria-describedby={describedBy} value={values[key]} onChange={(event) => change(key, event.target.value)} autoComplete="off" spellCheck={false} />}
        </Field>
      ))}
      <FunctionPicker names={names} value={values.functionName ?? ""} onChange={(name) => change("functionName", name)} />
      {rejected ? <p role="alert">{copy.rejected}</p> : null}
      <Button type="submit" disabled={pending}>{pending ? copy.loading : copy.submit}</Button>
      <Button type="button" variant="secondary" onClick={() => { setValues(defaults); setRejected(false); onEdit(); }}>{copy.reset}</Button>
    </form>
  );
}
