"use client";

import { Field } from "@/core/ui";
import { copy } from "../copy";

export function FunctionPicker({ names, value, onChange }: { names: string[]; value: string; onChange: (name: string) => void }) {
  return (
    <Field label={copy.picker} hint="Selecting a name fills the function field. The spec is not sent anywhere.">
      {({ inputId, describedBy }) => (
        <select id={inputId} aria-describedby={describedBy} value={names.includes(value) ? value : ""} onChange={(event) => onChange(event.target.value)} className="w-full rounded border p-2">
          <option value="">Choose a function</option>
          {names.map((name) => <option key={name} value={name}>{name}</option>)}
        </select>
      )}
    </Field>
  );
}
