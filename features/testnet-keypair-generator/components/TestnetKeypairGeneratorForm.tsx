"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { Input } from "@/core/ui/Input";
import { copy } from "@/features/testnet-keypair-generator/copy";

export function TestnetKeypairGeneratorForm({
  onSubmit,
  pending
}: {
  onSubmit: (label: string, checkNetwork: boolean) => void;
  pending: boolean;
}) {
  const [label, setLabel] = useState("");
  const [checkNetwork, setCheckNetwork] = useState(true);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(label, checkNetwork);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label={copy.formLabel} hint={copy.formHint}>
        {({ inputId, describedBy, invalid }) => (
          <Input
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="e.g. Test Keypair 1"
            autoComplete="off"
            spellCheck={false}
          />
        )}
      </Field>

      <div className="flex items-center gap-2">
        <input
          id="check-network-toggle"
          type="checkbox"
          checked={checkNetwork}
          onChange={(e) => setCheckNetwork(e.target.checked)}
          className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
        />
        <label htmlFor="check-network-toggle" className="text-xs text-muted-foreground">
          {copy.checkNetworkLabel}
        </label>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? copy.pending : copy.submit}
      </Button>
    </form>
  );
}
