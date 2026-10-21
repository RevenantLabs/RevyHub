"use client";

import { useState, type FormEvent } from "react";
import type { StellarNetwork } from "@/core/network/types";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { Select, Textarea } from "@/core/ui/Input";
import { copy } from "@/features/signing-payload-inspector/copy";

export function SigningPayloadInspectorForm({
  onSubmit, pending, network, onNetworkChange
}: {
  onSubmit: (value: string) => void;
  pending: boolean;
  network: StellarNetwork;
  onNetworkChange: (network: StellarNetwork) => void;
}) {
  const [value, setValue] = useState("");
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(value);
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field label={copy.formLabel} hint={copy.formHint} required>
        {({ inputId, describedBy, invalid, required }) => (
          <Textarea id={inputId} aria-describedby={describedBy} aria-invalid={invalid}
            required={required} value={value} onChange={(event) => setValue(event.target.value)}
            autoComplete="off" spellCheck={false} rows={6} />
        )}
      </Field>
      <Field label={copy.networkLabel} hint={copy.networkHint}>
        {({ inputId, describedBy }) => (
          <Select id={inputId} aria-describedby={describedBy} value={network}
            onChange={(event) => onNetworkChange(event.target.value as StellarNetwork)}>
            <option value="testnet">{copy.testnet}</option>
            <option value="mainnet">{copy.mainnet}</option>
          </Select>
        )}
      </Field>
      <Button type="submit" disabled={pending}>{pending ? copy.loading : copy.submit}</Button>
    </form>
  );
}
