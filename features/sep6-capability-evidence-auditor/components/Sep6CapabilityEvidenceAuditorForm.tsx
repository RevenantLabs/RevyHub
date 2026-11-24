"use client"

import { useState, type FormEvent } from "react"
import { Button } from "@/core/ui/Button"
import { Field } from "@/core/ui/Field"
import { Input, Textarea } from "@/core/ui/Input"
import { copy } from "@/features/sep6-capability-evidence-auditor/copy"
import type { RawSep6Input } from "@/features/sep6-capability-evidence-auditor/schema"

export function Sep6CapabilityEvidenceAuditorForm({
  onSubmit,
  pending
}: {
  onSubmit: (input: RawSep6Input) => void
  pending: boolean
}) {
  const [anchorUrl, setAnchorUrl] = useState("")
  const [infoJson, setInfoJson] = useState("")

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit({ anchorUrl, infoJson })
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
            value={anchorUrl}
            onChange={(event) => setAnchorUrl(event.target.value)}
            autoComplete="off"
            spellCheck={false}
            inputMode="url"
          />
        )}
      </Field>
      <Field label={copy.infoLabel} hint={copy.infoHint} required>
        {({ inputId, describedBy, invalid, required }) => (
          <Textarea
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            required={required}
            value={infoJson}
            onChange={(event) => setInfoJson(event.target.value)}
            rows={8}
            spellCheck={false}
          />
        )}
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? copy.working : copy.submit}
      </Button>
    </form>
  )
}
