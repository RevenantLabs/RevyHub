"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { CharacterPanel } from "@/components/ui/CharacterPanel";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { AddressInput } from "@/components/stellar/AddressInput";
import { validatePublicKey } from "@/lib/stellar/validateAddress";

// Shareable link parameter (see docs/ISSUES.md #38): ?address=<Stellar public address>
// Prefills the address field only; never triggers a Horizon request on its own.
const MAX_ADDRESS_PARAM_LENGTH = 100;
const PRINTABLE_ASCII = /^[\x20-\x7E]*$/;

export function sanitizeAddressParam(raw: string | null): string | null {
  if (raw === null) {
    return null;
  }

  const value = raw.trim();

  if (!value || value.length > MAX_ADDRESS_PARAM_LENGTH || !PRINTABLE_ASCII.test(value)) {
    return null;
  }

  return value;
}

function AddressValidatorContent() {
  const searchParams = useSearchParams();
  const rawAddressParam = searchParams.get("address");
  const [address, setAddress] = useState(() => sanitizeAddressParam(rawAddressParam) ?? "");
  const [paramIgnored] = useState(
    () => rawAddressParam !== null && sanitizeAddressParam(rawAddressParam) === null
  );
  const result = useMemo(() => validatePublicKey(address), [address]);
  const hasInput = address.trim().length > 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <CharacterPanel
        tone="star"
        eyebrow="Star clerk"
        title="Address Validator"
        description="The star clerk checks each public address like a name badge, using Stellar checksum rules while keeping secret keys out of the room."
      />
      <Card className="space-y-5">
        <AddressInput value={address} onChange={setAddress} />
        {hasInput ? (
          <StatusMessage
            type={result.valid ? "success" : "error"}
            title={result.valid ? "Valid public address" : "Invalid public address"}
            description={result.message}
          />
        ) : (
          <StatusMessage
            type="info"
            title="Hand the badge to the star clerk"
            description="Stellar public keys normally start with G. Never enter a secret key or seed phrase."
          />
        )}
        {paramIgnored ? (
          <StatusMessage
            type="warning"
            title="Link parameter ignored"
            description="The address in this link was empty, too long, or contained unsupported characters, so it was not applied."
          />
        ) : null}
      </Card>
    </div>
  );
}

export default function AddressValidatorPage() {
  return (
    <Suspense fallback={null}>
      <AddressValidatorContent />
    </Suspense>
  );
}
