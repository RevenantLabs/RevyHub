"use client";
import { useState, type FormEvent } from "react";
import { Button } from "@/core/ui/Button"; import { Field } from "@/core/ui/Field"; import { Input } from "@/core/ui/Input";
import { copy } from "@/features/horizon-stream-sampler/copy";
export function HorizonStreamSamplerForm({ onSubmit, pending }: { onSubmit: (value: string) => void; pending: boolean }) {
  const [sampleSize, setSampleSize] = useState("5"); const [duration, setDuration] = useState("10");
  function submit(event: FormEvent) { event.preventDefault(); onSubmit(`${sampleSize},${duration}`); }
  return <form onSubmit={submit} className="space-y-4">
    <Field label={copy.sampleSizeLabel} hint={copy.sampleSizeHint}>{({ inputId, describedBy }) => <Input id={inputId} aria-describedby={describedBy} type="number" min={1} max={25} value={sampleSize} onChange={(event) => setSampleSize(event.target.value)} />}</Field>
    <Field label={copy.durationLabel} hint={copy.durationHint}>{({ inputId, describedBy }) => <Input id={inputId} aria-describedby={describedBy} type="number" min={1} max={30} value={duration} onChange={(event) => setDuration(event.target.value)} />}</Field>
    <Button type="submit" disabled={pending}>{pending ? copy.working : copy.submit}</Button>
  </form>;
}
