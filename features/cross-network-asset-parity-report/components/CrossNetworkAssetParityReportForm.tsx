"use client"

import { useState, type FormEvent } from "react"
import { Button } from "@/core/ui/Button"
import { Field } from "@/core/ui/Field"
import { Textarea } from "@/core/ui/Input"
import { copy } from "@/features/cross-network-asset-parity-report/copy"
import type { RawParityInput } from "@/features/cross-network-asset-parity-report/schema"

export function CrossNetworkAssetParityReportForm({
  onSubmit,
  pending
}: {
  onSubmit: (input: RawParityInput) => void
  pending: boolean
}) {
  const [pairsJson, setPairsJson] = useState("")

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit({ pairsJson })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field label={copy.pairsLabel} hint={copy.pairsHint} required>
        {({ inputId, describedBy, invalid, required }) => (
          <Textarea
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            required={required}
            value={pairsJson}
            onChange={(event) => setPairsJson(event.target.value)}
            rows={10}
            spellCheck={false}
            placeholder='[{"id":"pair-1","left":{"network":"testnet","code":"USDC","issuer":"G..."},"right":{"network":"mainnet","code":"USDC","issuer":"G..."}}]'
          />
        )}
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? copy.working : copy.submit}
      </Button>
    </form>
  )
}
