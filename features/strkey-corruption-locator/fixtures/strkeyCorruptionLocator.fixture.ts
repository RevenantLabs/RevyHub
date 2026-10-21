import { Keypair, StrKey } from "@stellar/stellar-sdk";
import type { CandidateReport } from "@/features/strkey-corruption-locator/types";

/**
 * Deterministic StrKey samples derived from fixed raw seeds.
 * Nothing here is a live account secret; the seed bytes are a repeated test pattern.
 */
const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const validPublicKey = seed(1).publicKey();
export const contractAddress = StrKey.encodeContract(Buffer.alloc(32, 7));

/** Used only to prove the value is rejected and never echoed. */
export const secretSeed = seed(3).secret();

export const sampleCandidateReport: CandidateReport = {
  outcome: "candidates",
  length: 56,
  totalCandidates: 1,
  candidates: [
    {
      position: 4,
      originalCharacter: "A",
      replacement: "C",
      corrected: validPublicKey,
      kind: "ed25519PublicKey"
    }
  ]
};
