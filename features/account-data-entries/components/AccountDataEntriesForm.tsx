import React, { useState } from 'react';
import { Field } from "@/core/ui/Field";
import { Input } from "@/core/ui/Input";
import { Button } from "@/core/ui/Button";
import { copy } from "../copy";

interface Props {
  onSubmit: (val: string) => void;
  loading: boolean;
}

export function AccountDataEntriesForm({ onSubmit, loading }: Props) {
  const [val, setVal] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(val);
  };

  return (
    <form onSubmit={handleSubmit} data-testid="account-data-entries-form" className="space-y-4" noValidate>
      <Field label={copy.form.accountIdLabel}>
        {({ inputId, describedBy }) => (
          <Input
            id={inputId}
            aria-describedby={describedBy}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            placeholder={copy.form.accountIdPlaceholder}
            disabled={loading}
          />
        )}
      </Field>
      <Button type="submit" disabled={loading}>{copy.form.submitLabel}</Button>
    </form>
  );
}
