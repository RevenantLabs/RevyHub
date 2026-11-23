"use client";
import { useState, type FormEvent } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { Input, Select, Textarea } from "@/core/ui/Input";
import { copy } from "@/features/claimable-predicate-evaluator/copy";
import type { RawInput } from "@/features/claimable-predicate-evaluator/schema";
export function ClaimablePredicateEvaluatorForm({ onSubmit, pending }: { onSubmit: (raw: RawInput) => void; pending: boolean }) {
  const [source, setSource] = useState<RawInput["source"]>("balance_json");
  const [text, setText] = useState("");
  const [claimant, setClaimant] = useState("");
  const [evaluationTime, setEvaluationTime] = useState("");
  const [creationTime, setCreationTime] = useState("");
  function handleSubmit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); onSubmit({ source, text, claimant, evaluationTime, creationTime }); }
  return <form className="space-y-4" onSubmit={handleSubmit} noValidate>
    <Field label={copy.source}>{({ inputId, describedBy }) => <Select id={inputId} aria-describedby={describedBy} value={source} onChange={(e) => setSource(e.target.value as RawInput["source"])}><option value="balance_json">{copy.jsonOption}</option><option value="predicate_xdr">{copy.xdrOption}</option></Select>}</Field>
    <Field label={copy.text} hint={copy.textHint} required>{({ inputId, describedBy, required }) => <Textarea id={inputId} aria-describedby={describedBy} required={required} rows={7} value={text} onChange={(e) => setText(e.target.value)} autoComplete="off" spellCheck={false} />}</Field>
    <Field label={copy.claimant} hint={copy.claimantHint} required>{({ inputId, describedBy, required }) => <Input id={inputId} aria-describedby={describedBy} required={required} value={claimant} onChange={(e) => setClaimant(e.target.value)} autoComplete="off" spellCheck={false} />}</Field>
    <Field label={copy.evaluation} hint={copy.evaluationHint} required>{({ inputId, describedBy, required }) => <Input id={inputId} aria-describedby={describedBy} required={required} value={evaluationTime} onChange={(e) => setEvaluationTime(e.target.value)} placeholder={copy.evaluationExample} autoComplete="off" />}</Field>
    <Field label={copy.creation} hint={copy.creationHint}>{({ inputId, describedBy }) => <Input id={inputId} aria-describedby={describedBy} value={creationTime} onChange={(e) => setCreationTime(e.target.value)} placeholder={copy.creationExample} autoComplete="off" />}</Field>
    <Button type="submit" disabled={pending}>{pending ? copy.processing : copy.submit}</Button>
  </form>;
}
