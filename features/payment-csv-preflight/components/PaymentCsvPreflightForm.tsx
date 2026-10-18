"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { Textarea } from "@/core/ui/Input";
import { copy } from "@/features/payment-csv-preflight/copy";

export function PaymentCsvPreflightForm({
  onSubmitText,
  onSubmitFile,
  onReset,
  busy
}: {
  onSubmitText: (value: string) => void;
  onSubmitFile: (file: File) => void;
  onReset: () => void;
  busy: boolean;
}) {
  const [value, setValue] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmitText(value);
  }

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) onSubmitFile(file);
  }

  function handleReset() {
    setValue("");
    // Clearing the input's value lets the same file be chosen again; browsers
    // fire no change event when the selection is unchanged.
    if (fileInput.current) fileInput.current.value = "";
    onReset();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field label={copy.formLabel} hint={copy.formHint}>
        {({ inputId, describedBy }) => (
          <Textarea
            id={inputId}
            aria-describedby={describedBy}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={copy.formPlaceholder}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            rows={8}
            className="text-xs"
          />
        )}
      </Field>

      <Field label={copy.fileLabel} hint={copy.fileHint}>
        {({ inputId, describedBy }) => (
          <input
            ref={fileInput}
            id={inputId}
            aria-describedby={describedBy}
            type="file"
            accept=".csv,text/csv,text/plain"
            onChange={handleFile}
            className="block w-full text-sm text-[#4e5c73] file:mr-3 file:min-h-9 file:rounded-md file:border file:border-black/10 file:bg-[#d9f4ff] file:px-3 file:py-1 file:text-xs file:font-extrabold file:text-[#172033]"
          />
        )}
      </Field>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={busy}>
          {copy.submit}
        </Button>
        <Button type="button" variant="secondary" onClick={handleReset}>
          {copy.reset}
        </Button>
      </div>
    </form>
  );
}
