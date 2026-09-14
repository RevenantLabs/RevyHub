import { Keypair, StrKey, Networks } from "@stellar/stellar-sdk";
import { ok, err, type Result } from "@/core/result/result";
import type {
  GeneratedKeypair,
  KeypairErrorCode,
  KeypairValidation,
} from "@/features/testnet-keypair-generator/types";

export function generateTestnetKeypair(): GeneratedKeypair {
  const keypair = Keypair.random();
  return {
    publicKey: keypair.publicKey(),
    seed: keypair.secret(),
    network: "testnet",
  };
}

export function deriveFromSeed(
  seed: string
): Result<GeneratedKeypair, KeypairErrorCode> {
  try {
    const keypair = Keypair.fromSecret(seed);
    return ok({
      publicKey: keypair.publicKey(),
      seed: seed,
      network: "testnet",
    });
  } catch {
    return err("invalid_seed");
  }
}

export function derivePublicKeyFromRaw(
  rawSeed: Uint8Array
): Result<GeneratedKeypair, KeypairErrorCode> {
  try {
    const keypair = Keypair.fromRawEd25519Seed(rawSeed);
    return ok({
      publicKey: keypair.publicKey(),
      seed: keypair.secret(),
      network: "testnet",
    });
  } catch {
    return err("invalid_seed");
  }
}

export function validateKeypairInput(
  input: string
): KeypairValidation {
  if (!input) {
    return { valid: false, type: "unknown", message: "empty_input" };
  }

  if (input.startsWith("S")) {
    if (StrKey.isValidEd25519SecretSeed(input)) {
      return { valid: true, type: "seed", message: "Valid seed" };
    }
    return { valid: false, type: "seed", message: "Invalid seed format" };
  }

  if (input.startsWith("G")) {
    if (StrKey.isValidEd25519PublicKey(input)) {
      return { valid: true, type: "public", message: "Valid public key" };
    }
    return { valid: false, type: "public", message: "Invalid public key format" };
  }

  return { valid: false, type: "unknown", message: "Unknown format" };
}

export function getTestnetPassphrase(): string {
  return Networks.TESTNET;
}

export function getMainnetPassphrase(): string {
  return Networks.PUBLIC;
}
