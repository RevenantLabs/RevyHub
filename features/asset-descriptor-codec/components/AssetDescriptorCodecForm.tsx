"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { Input } from "@/core/ui/Input";
import { copy } from "@/features/asset-descriptor-codec/copy";
import type { CodecMode } from "@/features/asset-descriptor-codec/types";
import type { RawCodecInput } from "@/features/asset-descriptor-codec/schema";

/** Props for the AssetDescriptorCodecForm component. */
export interface AssetDescriptorCodecFormProps {
  onSubmit: (raw: RawCodecInput) => void;
  pending?: boolean;
}

/**
 * Form allowing the user to select encode/decode mode and submit classic asset representations.
 */
export function AssetDescriptorCodecForm({
  onSubmit,
  pending = false
}: AssetDescriptorCodecFormProps) {
  const [mode, setMode] = useState<CodecMode>("encode");
  const [value, setValue] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submittedValue = value;
    if (/^S/i.test(submittedValue) || /:S/i.test(submittedValue)) {
      setValue("");
    }
    onSubmit({ mode, value: submittedValue });
  }

  const hint = mode === "encode" ? copy.inputHintEncode : copy.inputHintDecode;
  const placeholder = mode === "encode" ? copy.inputPlaceholderEncode : copy.inputPlaceholderDecode;
  const submitText = mode === "encode" ? copy.submitEncode : copy.submitDecode;

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-[#637282]">
          {copy.modeLabel}
        </label>
        <div className="flex gap-2" role="radiogroup" aria-label={copy.modeLabel}>
          <button
            type="button"
            role="radio"
            aria-checked={mode === "encode"}
            onClick={() => setMode("encode")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
              mode === "encode"
                ? "bg-[#172033] text-white shadow-sm"
                : "border border-[#c7d6e8] bg-white/60 text-[#3b4758] hover:bg-white"
            }`}
          >
            {copy.modeEncode}
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={mode === "decode"}
            onClick={() => setMode("decode")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
              mode === "decode"
                ? "bg-[#172033] text-white shadow-sm"
                : "border border-[#c7d6e8] bg-white/60 text-[#3b4758] hover:bg-white"
            }`}
          >
            {copy.modeDecode}
          </button>
        </div>
      </div>

      <Field label={copy.inputLabel} hint={hint} required>
        {({ inputId, describedBy, invalid, required }) => (
          <Input
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            required={required}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={placeholder}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="font-mono"
          />
        )}
      </Field>

      <Button type="submit" disabled={pending}>
        {pending ? "Processing..." : submitText}
      </Button>
    </form>
  );
}
