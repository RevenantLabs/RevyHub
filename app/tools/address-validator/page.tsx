"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { CharacterPanel } from "@/components/ui/CharacterPanel";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { AddressInput } from "@/components/stellar/AddressInput";
import { validatePublicKey, validateMuxedAddress, type AddressValidationCode, type MuxedAddressValidationCode } from "@/lib/stellar/validateAddress";

type ValidationMode = "classic" | "muxed";

const CLASSIC_RESULT_TITLES: Record<AddressValidationCode, string> = {
  empty: "Hand the badge to the star clerk",
  "secret-key": "That's a secret key, not a public address",
  "muxed-account": "That's a muxed account address",
  "invalid-prefix": "Unrecognized address prefix",
  "invalid-characters": "Unexpected characters found",
  "invalid-length": "Address is the wrong length",
  "invalid-checksum": "Checksum does not match",
  valid: "Valid public address"
};

const MUXED_RESULT_TITLES: Record<MuxedAddressValidationCode, string> = {
  empty: "Hand the badge to the star clerk",
  "secret-key": "That's a secret key, not a muxed address",
  "classic-address": "That's a classic G-address",
  "invalid-prefix": "Unrecognized address prefix",
  "invalid-characters": "Unexpected characters found",
  "invalid-length": "Address is the wrong length",
  "invalid-checksum": "Checksum does not match",
  valid: "Valid muxed account address"
};



export default function AddressValidatorPage() {
  const [address, setAddress] = useState("");
  const [mode, setMode] = useState<ValidationMode>("classic");

  const result = useMemo(
    () => (mode === "classic" ? validatePublicKey(address) : validateMuxedAddress(address)),
    [address, mode]
  );
  const hasInput = address.trim().length > 0;

  const warningCodes = mode === "classic"
    ? ["secret-key" as string, "muxed-account" as string]
    : ["secret-key" as string, "classic-address" as string];

  const statusType = !hasInput
    ? "info"
    : result.valid
      ? "success"
      : warningCodes.includes(result.code)
        ? "warning"
        : "error";

  const resultTitles = mode === "classic" ? CLASSIC_RESULT_TITLES : MUXED_RESULT_TITLES;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <CharacterPanel
        tone="star"
        eyebrow="Star clerk"
        title="Address Validator"
        description="The star clerk checks each public address like a name badge, using Stellar checksum rules while keeping secret keys out of the room."
      />
      <Card className="space-y-5">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("classic")}
            className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
              mode === "classic"
                ? "bg-[#172033] text-white"
                : "bg-[#e8e4df] text-[#4e5c73] hover:bg-[#d4cfc8]"
            }`}
          >
            Classic (G...)
          </button>
          <button
            type="button"
            onClick={() => setMode("muxed")}
            className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
              mode === "muxed"
                ? "bg-[#172033] text-white"
                : "bg-[#e8e4df] text-[#4e5c73] hover:bg-[#d4cfc8]"
            }`}
          >
            Muxed (M...)
          </button>
        </div>
        <AddressInput
          value={address}
          onChange={setAddress}
          placeholder={mode === "classic" ? "G..." : "M..."}
          label={mode === "classic" ? "Stellar public address" : "Muxed account address"}
        />
        {hasInput && result.valid && mode === "classic" && (
          <p className="text-xs text-[#7a8a9e]">
            Tip: If this is part of a muxed account, switch to{" "}
            <button
              type="button"
              onClick={() => setMode("muxed")}
              className="font-medium text-[#172033] underline"
            >
              muxed mode
            </button>{" "}
            to validate it as an M-address.
          </p>
        )}
        <StatusMessage
          type={statusType}
          title={hasInput ? resultTitles[result.code as keyof typeof resultTitles] : resultTitles.empty}
          description={
            hasInput
              ? result.message
              : mode === "classic"
                ? "Stellar public keys normally start with G. Never enter a secret key or seed phrase."
                : "Stellar muxed accounts start with M. Never enter a secret key or seed phrase."
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
      <Card className="space-y-3">
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-[#9a6754]">
          What is a muxed account?
        </h2>
        <p className="text-sm leading-6 text-[#4e5c73]">
          A muxed (multiplexed) account address starts with{" "}
          <span className="font-bold text-[#172033]">M</span>, is{" "}
          <span className="font-bold text-[#172033]">69 characters</span> long, and embeds a
          numeric memo ID alongside a standard Stellar public key. This lets a single account
          receive payments tagged with different sub-identifiers — useful for exchanges, merchants,
          and custodians that need to attribute incoming payments to specific users without
          creating separate accounts.
        </p>
        <p className="text-sm leading-6 text-[#4e5c73]">
          Muxed addresses use the same base-32 character set and checksum scheme as classic
          G-addresses. Many Stellar tools accept M-addresses directly, but some older tools that
          expect a classic account ID may reject them. If a tool rejects your M-address, use the
          underlying G-address instead (the account behind the muxed address).
        </p>
      </Card>
    </div>
  );
}
