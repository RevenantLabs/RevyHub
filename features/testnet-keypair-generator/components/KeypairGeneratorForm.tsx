"use client";

import { useState } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/field";
import { copy } from "@/features/testnet-keypair-generator/copy";

interface Props {
  onGenerate: () => void;
  onDerive: (seed: string) => void;
}

export function KeypairGeneratorForm({ onGenerate, onDerive }: Props) {
  const [seed, setSeed] = useState("");

  return (
    <div className="space-y-4">
      <Field label={copy.formLabel} hint={copy.formHint}>
        {({ inputId, describedBy }) => (
          <input
            id={inputId}
            aria-describedby={describedBy}
            type="text"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            placeholder="S... (leave empty for new keypair)"
            className="w-full rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm text-[#172033] placeholder:text-[#9ca3af] focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1] font-mono"
          />
        )}
      </Field>

      <div className="flex gap-3">
        <Button type="button" onClick={onGenerate}>
          Generate New
        </Button>
        <Button type="button" onClick={() => onDerive(seed)} disabled={!seed.trim()}>
          Derive from Seed
        </Button>
      </div>
    </div>
  );
}
