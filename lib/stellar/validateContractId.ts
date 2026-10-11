import { StrKey } from "@stellar/stellar-sdk";

export interface ContractIdValidationResult {
  valid: boolean;
  type: "contract" | "publicKey" | "muxedAccount" | "secretSeed" | "malformed" | "empty";
  message: string;
  decodedPayload?: string;
  checksumValid?: boolean;
}

export function validateContractId(value: string): ContractIdValidationResult {
  const input = value.trim();

  if (!input) {
    return { valid: false, type: "empty", message: "Enter a Soroban contract ID to inspect it." };
  }

  const prefix = input[0];

  if (prefix === "G") {
    return {
      valid: false,
      type: "publicKey",
      message: "This starts with G, which is a classic Stellar account address, not a Soroban contract ID. Contract IDs start with C."
    };
  }

  if (prefix === "M") {
    return {
      valid: false,
      type: "muxedAccount",
      message: "This starts with M, which is a multiplexed account address, not a Soroban contract ID. Contract IDs start with C."
    };
  }

  if (prefix === "S") {
    return {
      valid: false,
      type: "secretSeed",
      message: "This starts with S, which is a secret seed. Never share secret keys. Contract IDs start with C."
    };
  }

  if (prefix !== "C") {
    return {
      valid: false,
      type: "malformed",
      message: `This value starts with "${prefix}", but Soroban contract IDs start with C.`
    };
  }

  if (input.length < 10) {
    return {
      valid: false,
      type: "malformed",
      message: "This value is too short to be a valid Soroban contract ID."
    };
  }

  if (!StrKey.isValidContract(input)) {
    return {
      valid: false,
      type: "malformed",
      message: "This does not match Soroban contract ID checksum or length requirements."
    };
  }

  let decodedPayload: string;
  try {
    const decoded = StrKey.decodeContract(input);
    decodedPayload = Buffer.from(decoded).toString("hex");
  } catch {
    return {
      valid: false,
      type: "malformed",
      message: "Contract ID checksum is invalid. The value may have been mistyped or corrupted."
    };
  }

  return {
    valid: true,
    type: "contract",
    message: "This is a valid Soroban contract ID with a correct checksum.",
    decodedPayload,
    checksumValid: true
  };
}
