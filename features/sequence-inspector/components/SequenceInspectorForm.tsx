"use client";

import { useState } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { Input } from "@/core/ui/Input";
import { copy } from "@/features/sequence-inspector/copy";

interface SequenceInspectorFormProps {
  onSubmit: (accountId: string, bumpTarget?: string) => void;
  isLoading: boolean;
}

export function SequenceInspectorForm({ onSubmit, isLoading }: SequenceInspectorFormProps) {
  const [accountId, setAccountId] = useState("");
  const [bumpTarget, setBumpTarget] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(accountId, bumpTarget);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Field label={copy.formLabel} hint={copy.formHint}>
        {({ inputId, describedBy, invalid, required }) => (
          <Input
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            required={required}
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            placeholder="G..."
            disabled={isLoading}
            autoComplete="off"
            spellCheck={false}
            className="font-mono text-sm"
          />
        )}
      </Field>

      <Field label={copy.bumpLabel} hint={copy.bumpHint}>
        {({ inputId, describedBy, invalid, required }) => (
          <Input
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            required={required}
            value={bumpTarget}
            onChange={(e) => setBumpTarget(e.target.value)}
            placeholder="Optional sequence number..."
            disabled={isLoading}
            autoComplete="off"
            spellCheck={false}
            className="font-mono text-sm"
          />
        )}
      </Field>

      <Button type="submit" disabled={isLoading || !accountId.trim()}>
        {isLoading ? copy.loading : copy.submit}
      </Button>
    </form>
  );
}
