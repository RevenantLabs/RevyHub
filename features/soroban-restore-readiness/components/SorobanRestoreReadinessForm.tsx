"use client";

import { useState } from "react";
import { Button, Field, Input, Select } from "@/core/ui";
import { copy } from "../copy";
import type { RawInput } from "../types";

const SECRET = /^S[A-Z2-7]{55}$/;

export function SorobanRestoreReadinessForm({
  onSubmit,
  onEdit,
  pending
}: {
  onSubmit: (raw: RawInput) => void;
  onEdit: () => void;
  pending: boolean;
}) {
  const [contractId, setContractId] = useState("");
  const [storageKeyXdr, setStorageKeyXdr] = useState("");
  const [durability, setDurability] = useState("persistent");
  const [rejected, setRejected] = useState(false);

  function changeContractId(value: string) {
    onEdit();
    if (SECRET.test(value.trim()) || value.trim().startsWith("S")) {
      setContractId("");
      setRejected(true);
      return;
    }
    setRejected(false);
    setContractId(value);
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({ contractId, storageKeyXdr, durability });
      }}
    >
      <Field label={copy.fields.contractId.label} hint={copy.fields.contractId.hint}>
        {({ inputId, describedBy }) => (
          <Input
            id={inputId}
            aria-describedby={describedBy}
            value={contractId}
            onChange={(event) => changeContractId(event.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
        )}
      </Field>
      {rejected ? <p role="alert">{copy.rejected}</p> : null}
      <Field label={copy.fields.storageKeyXdr.label} hint={copy.fields.storageKeyXdr.hint}>
        {({ inputId, describedBy }) => (
          <Input
            id={inputId}
            aria-describedby={describedBy}
            value={storageKeyXdr}
            onChange={(event) => {
              onEdit();
              setStorageKeyXdr(event.target.value);
            }}
            autoComplete="off"
            spellCheck={false}
          />
        )}
      </Field>
      <Field label={copy.fields.durability.label} hint={copy.fields.durability.hint}>
        {({ inputId, describedBy }) => (
          <Select
            id={inputId}
            aria-describedby={describedBy}
            value={durability}
            onChange={(event) => {
              onEdit();
              setDurability(event.target.value);
            }}
          >
            <option value="persistent">{copy.durabilityOptions.persistent}</option>
            <option value="temporary">{copy.durabilityOptions.temporary}</option>
          </Select>
        )}
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? copy.loading : copy.submit}
      </Button>
      <Button
        type="button"
        variant="secondary"
        onClick={() => {
          setContractId("");
          setStorageKeyXdr("");
          setDurability("persistent");
          setRejected(false);
          onEdit();
        }}
      >
        {copy.reset}
      </Button>
    </form>
  );
}
