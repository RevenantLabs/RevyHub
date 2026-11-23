"use client";

import { useRef, type FormEvent } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { copy } from "@/features/contract-upgrade-diff-report/copy";
import type { RawUpgradeFiles, UpgradeSide } from "@/features/contract-upgrade-diff-report/types";

const fileInputClass =
  "block w-full text-sm text-[#4e5c73] file:mr-3 file:min-h-9 file:rounded-md file:border file:border-black/10 " +
  "file:bg-[#d9f4ff] file:px-3 file:py-1 file:text-xs file:font-extrabold file:text-[#172033] " +
  "aria-[invalid=true]:text-[#9f342d]";

export function ContractUpgradeDiffReportForm({
  onSubmit,
  onReset,
  pending,
  invalidSide
}: {
  onSubmit: (files: RawUpgradeFiles) => void;
  onReset: () => void;
  pending: boolean;
  /** The side the current error belongs to; marked invalid without repeating the message. */
  invalidSide?: UpgradeSide;
}) {
  const oldInput = useRef<HTMLInputElement>(null);
  const newInput = useRef<HTMLInputElement>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({
      oldFile: oldInput.current?.files?.[0] ?? null,
      newFile: newInput.current?.files?.[0] ?? null
    });
  }

  function handleReset() {
    // Clearing the value lets the same file be chosen again.
    if (oldInput.current) oldInput.current.value = "";
    if (newInput.current) newInput.current.value = "";
    onReset();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field label={copy.oldLabel} hint={copy.oldHint} required>
        {({ inputId, describedBy, required }) => (
          <input
            ref={oldInput}
            id={inputId}
            type="file"
            accept=".wasm,application/wasm"
            aria-describedby={describedBy}
            aria-invalid={invalidSide === "old"}
            required={required}
            className={fileInputClass}
          />
        )}
      </Field>

      <Field label={copy.newLabel} hint={copy.newHint} required>
        {({ inputId, describedBy, required }) => (
          <input
            ref={newInput}
            id={inputId}
            type="file"
            accept=".wasm,application/wasm"
            aria-describedby={describedBy}
            aria-invalid={invalidSide === "new"}
            required={required}
            className={fileInputClass}
          />
        )}
      </Field>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? copy.working : copy.submit}
        </Button>
        <Button type="button" variant="secondary" onClick={handleReset}>
          {copy.reset}
        </Button>
      </div>
    </form>
  );
}
