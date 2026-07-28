"use client";

import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { CharacterPanel } from "@/components/ui/CharacterPanel";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { AddressInput } from "@/components/stellar/AddressInput";
import { Button } from "@/components/ui/Button";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";
import { validatePublicKey } from "@/lib/stellar/validateAddress";

export default function AddressValidatorPage() {
  const [address, setAddress] = useState("");
  const { copied, copy } = useCopyToClipboard();
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
          <div className="space-y-3">
            <StatusMessage
              type={result.valid ? "success" : "error"}
              title={result.valid ? "Valid public address" : "Invalid public address"}
              description={result.message}
            />
            {result.valid ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => copy(address)}
                className="w-full sm:w-auto"
              >
                <Copy className="mr-1.5 h-4 w-4" aria-hidden />
                {copied ? "Copied" : "Copy address"}
              </Button>
            ) : null}
          </div>
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
