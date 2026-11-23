"use client"

import { useState, type FormEvent } from "react"
import { Button } from "@/core/ui/Button"
import { Field } from "@/core/ui/Field"
import { Input, Textarea } from "@/core/ui/Input"
import { copy } from "@/features/sep38-quote-expiry-auditor/copy"
import type { RawSep38Input } from "@/features/sep38-quote-expiry-auditor/schema"

export function Sep38QuoteExpiryAuditorForm({
  onSubmit,
  pending
}: {
  onSubmit: (input: RawSep38Input) => void
  pending: boolean
}) {
  const [anchorId, setAnchorId] = useState("")
  const [evaluationTime, setEvaluationTime] = useState("")
  const [quoteJson, setQuoteJson] = useState("")

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit({ anchorId, evaluationTime, quoteJson })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field label={copy.anchorLabel} hint={copy.anchorHint} required>
        {({ inputId, describedBy, invalid, required }) => (
          <Input
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            required={required}
            value={anchorId}
            onChange={(event) => setAnchorId(event.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
        )}
      </Field>
      <Field label={copy.evaluationLabel} hint={copy.evaluationHint} required>
        {({ inputId, describedBy, invalid, required }) => (
          <Input
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            required={required}
            value={evaluationTime}
            onChange={(event) => setEvaluationTime(event.target.value)}
            autoComplete="off"
            spellCheck={false}
            placeholder="2026-06-01T12:00:00Z"
          />
        )}
      </Field>
      <Field label={copy.quoteLabel} hint={copy.quoteHint} required>
        {({ inputId, describedBy, invalid, required }) => (
          <Textarea
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            required={required}
            value={quoteJson}
            onChange={(event) => setQuoteJson(event.target.value)}
            autoComplete="off"
            spellCheck={false}
            rows={8}
          />
        )}
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? copy.working : copy.submit}
      </Button>
    </form>
  )
}
