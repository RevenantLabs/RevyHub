"use client";
import { type FormEvent } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { Input } from "@/core/ui/Input";
import { copy, errorCopy } from "@/features/horizon-rate-limit-monitor/copy";
import type { MonitorErrorCode } from "@/features/horizon-rate-limit-monitor/types";

export function HorizonRateLimitMonitorForm({ onCheck, pending, loaded, error }: {
  onCheck: (accountId: string, threshold: string) => void; pending: boolean; loaded: boolean; error?: MonitorErrorCode;
}) {
  const { label } = useNetwork();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const account = event.currentTarget.elements.namedItem("account") as HTMLInputElement;
    const threshold = event.currentTarget.elements.namedItem("threshold") as HTMLInputElement;
    const value = account.value;
    // Do not retain or echo a seed after submission.
    if (value.trim().toUpperCase().startsWith("S")) account.value = "";
    onCheck(value, threshold.value);
  }
  return <form onSubmit={submit} noValidate className="space-y-4">
    <Field label={copy.accountLabel} hint={copy.accountHint} error={error === "invalid_account" ? errorCopy.invalid_account.description : undefined}>
      {({ inputId, describedBy, invalid }) => <Input id={inputId} name="account" aria-describedby={describedBy} aria-invalid={invalid} autoComplete="off" spellCheck={false} />}
    </Field>
    <Field label={copy.thresholdLabel} hint={copy.thresholdHint} error={error === "invalid_threshold" ? errorCopy.invalid_threshold.description : undefined}>
      {({ inputId, describedBy, invalid }) => <Input id={inputId} name="threshold" aria-describedby={describedBy} aria-invalid={invalid} defaultValue="10" inputMode="numeric" />}
    </Field>
    <div className="flex items-center gap-3"><Button type="submit" disabled={pending}>{pending ? copy.loading : loaded ? copy.refresh : copy.submit}</Button><span className="text-sm text-[#68758a]">{label}</span></div>
  </form>;
}
