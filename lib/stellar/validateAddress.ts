import { StrKey } from "@stellar/stellar-sdk";

export interface AddressValidationResult {
  valid: boolean;
  message: string;
}

export interface ContractValidationResult {
  valid: boolean;
  message: string;
  /** Decoded 32-byte payload as lowercase hex, when valid. */
  decodedHex?: string;
  /** Whether the checksum passed, when valid. */
  checksumValid?: boolean;
}

export function validatePublicKey(value: string): AddressValidationResult {
  // TODO(issue #2): Return structured validation codes so the UI can show field-specific recovery guidance.
  const address = value.trim();

  if (!address) {
    return {
      valid: false,
      message: "Enter a Stellar public address to validate it."
    };
  }

  if (!address.startsWith("G")) {
    return {
      valid: false,
      message: "Stellar public addresses usually start with G and are safe to share."
    };
  }

  if (!StrKey.isValidEd25519PublicKey(address)) {
    return {
      valid: false,
      message: "This does not match Stellar public key checksum or length requirements."
    };
  }

  return {
    valid: true,
    message: "This is a valid Stellar public address."
  };
}

/**
 * Validates a Soroban contract ID using Stellar SDK StrKey checks.
 *
 * Contract IDs are StrKey-encoded and start with "C".
 * This function uses the SDK's `isValidContract` which verifies the
 * version byte, payload length (32 bytes), and checksum.
 *
 * Distinct rejection messages are provided for:
 * - Empty input
 * - Classic account keys (G...)
 * - Muxed accounts (M...)
 * - Secret seeds (S...)
 * - Malformed values
 */
export function validateContractId(value: string): ContractValidationResult {
  const id = value.trim();

  if (!id) {
    return {
      valid: false,
      message: "Enter a Soroban contract ID to validate it."
    };
  }

  // Provide distinct rejection hints based on prefix before SDK check
  const prefix = id[0];

  if (prefix === "G") {
    return {
      valid: false,
      message:
        "This is a classic account public key (G...), not a Soroban contract ID. " +
        "Contract IDs start with C and represent deployed smart contracts on Stellar."
    };
  }

  if (prefix === "M") {
    return {
      valid: false,
      message:
        "This is a muxed account address (M...), not a Soroban contract ID. " +
        "Contract IDs start with C."
    };
  }

  if (prefix === "S") {
    return {
      valid: false,
      message:
        "This looks like a secret seed (S...). Never share private keys. " +
        "Contract IDs start with C and are safe to share."
    };
  }

  if (!StrKey.isValidContract(id)) {
    return {
      valid: false,
      message:
        "This does not match the Soroban contract ID format. " +
        "Contract IDs are StrKey-encoded, start with C, and contain a 32-byte payload with a checksum."
    };
  }

  // Decode payload bytes for display — does NOT imply on-chain existence
  const decoded = StrKey.decodeContract(id);
  const hex = Buffer.from(decoded).toString("hex");

  return {
    valid: true,
    message:
      "This is a syntactically valid Soroban contract ID. The StrKey format encodes a 32-byte payload " +
      "with a version byte and checksum. This does not confirm the contract exists on any network.",
    decodedHex: hex,
    checksumValid: true
  };
}

/** Constants for explorer links keyed by network. */
export const contractExplorerUrls: Record<string, string> = {
  testnet: "https://stellar.expert/explorer/testnet/contract",
  mainnet: "https://stellar.expert/explorer/public/contract"
} as const;

export function getContractExplorerUrl(contractId: string, network: string): string | null {
  const base = contractExplorerUrls[network];
  if (!base) return null;
  return `${base}/${contractId}`;
}
