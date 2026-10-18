"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { Input, Select, Textarea } from "@/core/ui/Input";
import { copy, encodingLabels, modeLabels } from "@/features/manage-data-codec/copy";
import { isManageDataMode, isValueEncoding } from "@/features/manage-data-codec/schema";
import type { RawManageDataInput } from "@/features/manage-data-codec/schema";
import type { ManageDataMode, ValueEncoding } from "@/features/manage-data-codec/types";

export function ManageDataCodecForm({
  onSubmit,
  onReset
}: {
  onSubmit: (input: RawManageDataInput) => void;
  onReset: () => void;
}) {
  const [mode, setMode] = useState<ManageDataMode>("set");
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [encoding, setEncoding] = useState<ValueEncoding>("utf8");

  const isDelete = mode === "delete";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({ mode, name, value, encoding });
  }

  function handleReset() {
    setMode("set");
    setName("");
    setValue("");
    setEncoding("utf8");
    onReset();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field label={copy.modeLabel} hint={copy.modeHint} required>
        {({ inputId, describedBy, required }) => (
          <Select
            id={inputId}
            aria-describedby={describedBy}
            required={required}
            value={mode}
            onChange={(event) => {
              if (isManageDataMode(event.target.value)) setMode(event.target.value);
            }}
          >
            <option value="set">{modeLabels.set}</option>
            <option value="delete">{modeLabels.delete}</option>
          </Select>
        )}
      </Field>

      <Field label={copy.nameLabel} hint={copy.nameHint} required>
        {({ inputId, describedBy, invalid, required }) => (
          <Input
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            required={required}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="config.version"
            autoComplete="off"
            spellCheck={false}
          />
        )}
      </Field>

      {/*
        The value inputs are hidden in delete mode rather than disabled: a
        deletion carries no value at all, and leaving a greyed-out field on
        screen suggests the typed text is still part of the operation.
      */}
      {isDelete ? null : (
        <>
          <Field label={copy.encodingLabel} hint={copy.encodingHint} required>
            {({ inputId, describedBy, required }) => (
              <Select
                id={inputId}
                aria-describedby={describedBy}
                required={required}
                value={encoding}
                onChange={(event) => {
                  if (isValueEncoding(event.target.value)) setEncoding(event.target.value);
                }}
              >
                <option value="utf8">{encodingLabels.utf8}</option>
                <option value="hex">{encodingLabels.hex}</option>
                <option value="base64">{encodingLabels.base64}</option>
              </Select>
            )}
          </Field>

          <Field label={copy.valueLabel} hint={copy.valueHint}>
            {({ inputId, describedBy, invalid }) => (
              <Textarea
                id={inputId}
                aria-describedby={describedBy}
                aria-invalid={invalid}
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder="1.4.0"
                autoComplete="off"
                spellCheck={false}
                rows={3}
              />
            )}
          </Field>
        </>
      )}

      <div className="flex flex-wrap gap-3">
        <Button type="submit">{copy.submit}</Button>
        <Button type="button" variant="secondary" onClick={handleReset}>
          {copy.resetAll}
        </Button>
      </div>
    </form>
  );
}
