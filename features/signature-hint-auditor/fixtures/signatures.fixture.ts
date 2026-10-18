import { Keypair } from "@stellar/stellar-sdk";
import {
  multiSignedClassicXdr,
  source,
  sourceHint
} from "@/features/signature-hint-auditor/fixtures/signatureHintAuditor.fixture";
import type { PublicSignerHint } from "@/features/signature-hint-auditor/types";

/**
 * Deterministic edge-case data for multi-signature envelopes.
 *
 * Hints stay in the order the envelope carries them.
 */
const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const firstSigner = source;
export const secondSigner = seed(4);

export const multiSignatureEnvelopeXdr = multiSignedClassicXdr;

export const orderedHints = [
  sourceHint,
  // secondSigner is seed(4) — same as extraSigner in the main fixture
  Buffer.from(secondSigner.signatureHint()).toString("hex")
] as const;

export const matchingPublicKeys = [firstSigner.publicKey(), secondSigner.publicKey()];
