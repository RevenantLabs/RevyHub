"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { CharacterPanel } from "@/components/ui/CharacterPanel";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { AddressInput } from "@/components/stellar/AddressInput";
import { validatePublicKey } from "@/lib/stellar/validateAddress";

export default function AddressValidatorPage() {
  const [address, setAddress] = useState("");
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
      </Card>
    </div>
  );
}
