"use client";
import { useState, type FormEvent } from "react";
import { Networks } from "@stellar/stellar-sdk";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { Input, Textarea, Select } from "@/core/ui/Input";
import { copy } from "../copy";
import type { RawAuditInput } from "../schema";
export function SorobanAuthNonceExpiryAuditorForm({onSubmit, onEdit, pending}: {onSubmit: (raw: RawAuditInput) => void; onEdit: () => void; pending: boolean}) {
  const [bundle, setBundle] = useState("");
  const [choice, setChoice] = useState("");
  const [custom, setCustom] = useState("");
  const [evaluationLedger, setEvaluationLedger] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); onSubmit({bundle, networkPassphrase: choice === "custom" ? custom : choice, evaluationLedger}); }
  return <form onSubmit={submit} onChange={onEdit} className="space-y-4" noValidate>
    <Field label={copy.bundleLabel} hint={copy.bundleHint} required>{({inputId, describedBy, required}) => <Textarea id={inputId} aria-describedby={describedBy} required={required} value={bundle} onChange={(event) => setBundle(event.target.value)} rows={6} autoComplete="off" spellCheck={false}/>}</Field>
    <Field label={copy.networkLabel} hint={copy.networkHint} required>{({inputId, describedBy, required}) => <Select id={inputId} aria-describedby={describedBy} required={required} value={choice} onChange={(event) => setChoice(event.target.value)}><option value="">{copy.chooseNetwork}</option><option value={Networks.TESTNET}>{copy.testnet}</option><option value={Networks.PUBLIC}>{copy.public}</option><option value={Networks.FUTURENET}>{copy.futurenet}</option><option value="custom">{copy.custom}</option></Select>}</Field>
    {choice === "custom" ? <Field label={copy.customNetworkLabel} required>{({inputId, describedBy, required}) => <Input id={inputId} aria-describedby={describedBy} required={required} value={custom} onChange={(event) => setCustom(event.target.value)} autoComplete="off"/>}</Field> : null}
    <Field label={copy.ledgerLabel} hint={copy.ledgerHint}>{({inputId, describedBy}) => <Input id={inputId} aria-describedby={describedBy} inputMode="numeric" value={evaluationLedger} onChange={(event) => setEvaluationLedger(event.target.value)}/>}</Field>
    <Button type="submit" disabled={pending}>{pending ? copy.working : copy.submit}</Button>
  </form>;
}
