"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { Input } from "@/core/ui/Input";
import { copy } from "@/features/scval-codec/copy";

export function ScvalCodecForm({
  onSubmit,
  pending
}: {
  onSubmit: (value: string, mode: string) => void;
  pending: boolean;
}) {
  const [value, setValue] = useState("");
  const [mode, setMode] = useState<"decode" | "encode">("decode");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(value, mode);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label={copy.modeLabel}>
        {({ inputId }) => (
          <select
            id={inputId}
            value={mode}
            onChange={(event) => setMode(event.target.value as "decode" | "encode")}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <option value="decode">{copy.modeDecode}</option>
            <option value="encode">{copy.modeEncode}</option>
          </select>
        )}
      </Field>
      <Field label={copy.formLabel} hint={copy.formHint}>
        {({ inputId, describedBy, invalid }) => (
          <Input
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
        )}
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? "Working..." : copy.submit}
      </Button>
    </form>
  );
}
