"use client";

import { useState } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/field";
import { copy } from "@/features/network-passphrase-inspector/copy";

interface Props {
  onSubmit: (query: string, type: string) => void;
}

export function NetworkPassphraseInspectorForm({ onSubmit }: Props) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(query, type); }}
      className="space-y-4"
    >
      <Field label={copy.formLabel} hint={copy.formHint} required>
        {({ inputId, describedBy, invalid }) => (
          <input
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="mainnet, testnet, passphrase..."
            className="w-full rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm text-[#172033] placeholder:text-[#9ca3af] focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
          />
        )}
      </Field>

      <div>
        <label htmlFor="network-type-filter" className="block text-sm font-bold text-[#172033]">
          {copy.typeLabel}
        </label>
        <select
          id="network-type-filter"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="mt-1 w-full rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm text-[#172033]"
        >
          <option value="all">{copy.allTypes}</option>
          <option value="mainnet">Mainnet</option>
          <option value="testnet">Testnet</option>
          <option value="futurenet">Futurenet</option>
        </select>
      </div>

      <Button type="submit">{copy.submit}</Button>
    </form>
  );
}
