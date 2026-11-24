"use client"

import { useState, type FormEvent } from "react"
import { Button } from "@/core/ui/Button"
import { Field } from "@/core/ui/Field"
import { Input, Select, Textarea } from "@/core/ui/Input"
import { copy } from "@/features/sep31-field-readiness-checker/copy"
import type { RawSep31Input } from "@/features/sep31-field-readiness-checker/schema"

export function Sep31FieldReadinessCheckerForm({
  onSubmit,
  pending
}: {
  onSubmit: (input: RawSep31Input) => void
  pending: boolean
}) {
  const [anchorId, setAnchorId] = useState("")
  const [assetCode, setAssetCode] = useState("")
  const [context, setContext] = useState("sender")
  const [requirementsJson, setRequirementsJson] = useState("")
  const [fieldMapJson, setFieldMapJson] = useState("")

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit({ anchorId, assetCode, context, requirementsJson, fieldMapJson })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field label={copy.anchorLabel} required>
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
      <Field label={copy.assetLabel} required>
        {({ inputId, describedBy, invalid, required }) => (
          <Input
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            required={required}
            value={assetCode}
            onChange={(event) => setAssetCode(event.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
        )}
      </Field>
      <Field label={copy.contextLabel} required>
        {({ inputId, describedBy, invalid, required }) => (
          <Select
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            required={required}
            value={context}
            onChange={(event) => setContext(event.target.value)}
          >
            <option value="sender">{copy.contextSender}</option>
            <option value="receiver">{copy.contextReceiver}</option>
          </Select>
        )}
      </Field>
      <Field label={copy.requirementsLabel} hint={copy.requirementsHint} required>
        {({ inputId, describedBy, invalid, required }) => (
          <Textarea
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            required={required}
            value={requirementsJson}
            onChange={(event) => setRequirementsJson(event.target.value)}
            rows={6}
            spellCheck={false}
          />
        )}
      </Field>
      <Field label={copy.fieldMapLabel} hint={copy.fieldMapHint} required>
        {({ inputId, describedBy, invalid, required }) => (
          <Textarea
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            required={required}
            value={fieldMapJson}
            onChange={(event) => setFieldMapJson(event.target.value)}
            rows={4}
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
