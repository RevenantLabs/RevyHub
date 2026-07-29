"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { CharacterPanel } from "@/components/ui/CharacterPanel";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { AddressInput } from "@/components/stellar/AddressInput";
import { validatePublicKey, type AddressValidationCode } from "@/lib/stellar/validateAddress";

const RESULT_TITLES: Record<AddressValidationCode, string> = {
  empty: "Hand the badge to the star clerk",
  "secret-key": "That's a secret key, not a public address",
  "muxed-account": "That's a muxed account address",
  "invalid-prefix": "Unrecognized address prefix",
  "invalid-characters": "Unexpected characters found",
  "invalid-length": "Address is the wrong length",
  "invalid-checksum": "Checksum does not match",
  valid: "Valid public address"
};

const WARNING_CODES: AddressValidationCode[] = ["secret-key", "muxed-account"];

export default function AddressValidatorPage() {
  const [address, setAddress] = useState("");
  const result = useMemo(() => validatePublicKey(address), [address]);
  const hasInput = address.trim().length > 0;

  const statusType = !hasInput
    ? "info"
    : result.valid
      ? "success"
      : WARNING_CODES.includes(result.code)
        ? "warning"
        : "error";

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
        <StatusMessage
          type={statusType}
          title={hasInput ? RESULT_TITLES[result.code] : RESULT_TITLES.empty}
          description={
            hasInput
              ? result.message
              : "Stellar public keys normally start with G. Never enter a secret key or seed phrase."
          }
        />
      </Card>
      <Card className="space-y-3">
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-[#9a6754]">
          What is a Stellar public key?
        </h2>
        <p className="text-sm leading-6 text-[#4e5c73]">
          A Stellar public key (also called a public address) identifies an account on the
          network — like a badge or a mailing address. It always starts with{" "}
          <span className="font-bold text-[#172033]">G</span>, is exactly{" "}
          <span className="font-bold text-[#172033]">56 characters</span> long, and is built from
          the letters A–Z and digits 2–7. It ends with a built-in checksum, so a single mistyped
          character will almost always fail validation instead of silently pointing to the wrong
          account.
        </p>
        <p className="text-sm leading-6 text-[#4e5c73]">
          A public key is safe to share — send it to anyone who wants to pay you. Its counterpart,
          the <span className="font-bold text-[#172033]">secret key</span>, starts with{" "}
          <span className="font-bold text-[#172033]">S</span> and must never be shared with
          anyone or entered into a tool like this one.
        </p>
      </Card>
    </div>
  );
}
