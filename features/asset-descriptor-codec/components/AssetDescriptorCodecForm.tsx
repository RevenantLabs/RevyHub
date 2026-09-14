"use client";

import { useState } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/field";
import { copy } from "@/features/asset-descriptor-codec/copy";

interface Props {
  onSubmit: (raw: string) => void;
  loading?: boolean;
}

export function AssetDescriptorCodecForm({ onSubmit, loading }: Props) {
  const [input, setInput] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(input);
      }}
      className="space-y-4"
    >
      <Field label={copy.formLabel} hint={copy.formHint} required>
        {({ inputId, describedBy, invalid }) => (
          <textarea
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="XLM, USDC:GABC..., or base64 XDR"
            className="w-full rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm text-[#172033] placeholder:text-[#9ca3af] focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
            rows={2}
          />
        )}
      </Field>

      <Button type="submit" disabled={loading}>
        {loading ? copy.loading : copy.submit}
      </Button>
    </form>
  );
}
