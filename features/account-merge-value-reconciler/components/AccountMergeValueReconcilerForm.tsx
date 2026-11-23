"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { copy } from "../copy";
import type { AccountMergeValueReconcilerInput as Input } from "../types";

export function AccountMergeValueReconcilerForm({ onSubmit, pending }: { onSubmit: (input: Input) => void; pending: boolean }) {
  const [input, setInput] = useState<Input>({ envelope: "", resultXdr: "", metadataXdr: "" });
  function update(key: keyof Input, value: string) { setInput((current) => ({ ...current, [key]: value })); }
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); onSubmit(input); }
  return <form onSubmit={submit} className="space-y-4">
    {([
      ["envelope", copy.envelopeLabel, copy.inputHint],
      ["resultXdr", copy.resultLabel, copy.inputHint],
      ["metadataXdr", copy.metadataLabel, copy.metadataHint]
    ] as const).map(([key, label, hint]) => <Field key={key} label={label} hint={hint}>
      {({ inputId, describedBy }) => <textarea id={inputId} aria-describedby={describedBy} value={input[key]}
        onChange={(event) => update(key, event.target.value)} autoComplete="off" spellCheck={false}
        rows={3} className="w-full rounded-lg border border-[#cbd7e7] bg-white p-3 font-mono text-xs text-[#172033]" />}
    </Field>)}
    <Button type="submit" disabled={pending}>{pending ? copy.loading : copy.submit}</Button>
  </form>;
}
