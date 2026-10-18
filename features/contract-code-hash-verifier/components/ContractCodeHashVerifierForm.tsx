"use client";

import { useState } from "react";
import { Button, Field, Input } from "@/core/ui";
import { copy } from "../copy";
import type { RawInput } from "../types";

const secret = /^S[A-Z2-7]{55}$/;

export function ContractCodeHashVerifierForm({ onSubmit, onEdit, pending }: { onSubmit: (raw: RawInput) => void; onEdit: () => void; pending: boolean }) {
  const [contractId, setContractId] = useState("");
  const [rejected, setRejected] = useState(false);

  function change(value: string) {
    onEdit();
    if (secret.test(value.trim())) {
      setContractId("");
      setRejected(true);
      return;
    }
    setRejected(false);
    setContractId(value);
  }

  return (
    <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); onSubmit({ contractId }); }}>
      <Field label={copy.fields.contractId.label} hint={copy.fields.contractId.hint}>
        {({ inputId, describedBy }) => (
          <Input id={inputId} aria-describedby={describedBy} value={contractId} onChange={(event) => change(event.target.value)} autoComplete="off" spellCheck={false} />
        )}
      </Field>
      {rejected ? <p role="alert">{copy.rejected}</p> : null}
      <Button type="submit" disabled={pending}>{pending ? copy.loading : copy.submit}</Button>
      <Button type="button" variant="secondary" onClick={() => { setContractId(""); setRejected(false); onEdit(); }}>{copy.reset}</Button>
    </form>
  );
}
