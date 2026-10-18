"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { Input } from "@/core/ui/Input";
import { copy, errorCopy } from "@/features/account-activity-rollup/copy";
import type { AccountActivityRollupErrorCode } from "@/features/account-activity-rollup/types";

export function AccountActivityRollupForm({ onSubmit, pending, error }: { onSubmit: (raw: string) => void; pending: boolean; error: AccountActivityRollupErrorCode | null }) {
  const [accountId, setAccountId] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(accountId);
    if (accountId.trim().startsWith("S")) setAccountId("");
  }
  return <form onSubmit={submit} className="space-y-4">
    <Field label={copy.formLabel} hint={copy.formHint} error={error === "invalid_account" ? errorCopy.invalid_account.title : null}>
      {({ inputId, describedBy, invalid }) => <Input id={inputId} aria-describedby={describedBy} aria-invalid={invalid} value={accountId} onChange={(event) => setAccountId(event.target.value.trimStart().startsWith("S") ? "" : event.target.value)} autoComplete="off" spellCheck={false} />}
    </Field>
    <Button type="submit" disabled={pending}>{pending ? copy.loading : copy.submit}</Button>
  </form>;
}
