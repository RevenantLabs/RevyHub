"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { Input } from "@/core/ui/Input";
import { useNetwork } from "@/core/network/NetworkProvider";
import { copy } from "@/features/sponsorship-planner/copy";
import type { SponsorshipPlannerField } from "@/features/sponsorship-planner/types";

export function SponsorshipPlannerForm({
  onSubmit,
  pending,
  errorField,
  errorMessage
}: {
  onSubmit: (sponsor: string, sponsored: string) => void;
  pending: boolean;
  errorField: SponsorshipPlannerField | null;
  errorMessage: string | null;
}) {
  const [sponsor, setSponsor] = useState("");
  const [sponsored, setSponsored] = useState("");
  const { label } = useNetwork();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(sponsor, sponsored);
  }

  const errorFor = (field: SponsorshipPlannerField) =>
    errorField === field ? errorMessage : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field
        label={copy.sponsorLabel}
        hint={`${copy.sponsorHint} ${label}.`}
        error={errorFor("sponsor")}
      >
        {({ inputId, describedBy, invalid }) => (
          <Input
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            value={sponsor}
            onChange={(event) => setSponsor(event.target.value)}
            placeholder={copy.sponsorPlaceholder}
            autoComplete="off"
            spellCheck={false}
            className="font-mono"
          />
        )}
      </Field>

      <Field
        label={copy.sponsoredLabel}
        hint={`${copy.sponsoredHint} ${label}.`}
        error={errorFor("sponsored")}
      >
        {({ inputId, describedBy, invalid }) => (
          <Input
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            value={sponsored}
            onChange={(event) => setSponsored(event.target.value)}
            placeholder={copy.sponsoredPlaceholder}
            autoComplete="off"
            spellCheck={false}
            className="font-mono"
          />
        )}
      </Field>

      <Button type="submit" disabled={pending}>
        {pending ? copy.loading : copy.submit}
      </Button>
    </form>
  );
}
