import { Keypair } from "@stellar/stellar-sdk";
import {
  signedClassicXdr,
  source,
  sourceHint,
  unrelatedSigner
} from "@/features/signature-hint-auditor/fixtures/signatureHintAuditor.fixture";
import type { PublicSignerHint } from "@/features/signature-hint-auditor/types";

/**
 * Collision scenario for hint matching.
 *
 * Real ed25519 public keys almost never share a four-byte hint in a small
 * fixture set, so the impostor is a genuine `G…` key whose *recorded* hint is
 * forced to equal the source hint. That exercises the collision path the UI
 * must take when two candidates share four bytes — without claiming the
 * underlying keys collide on-chain.
 */
export const collisionEnvelopeXdr = signedClassicXdr;

export const collisionHint = sourceHint;

export const realCandidate: PublicSignerHint = {
  publicKey: source.publicKey(),
  hint: collisionHint
};

export const impostorCandidate: PublicSignerHint = {
  publicKey: unrelatedSigner.publicKey(),
  hint: collisionHint
};

export const collidingCandidates: PublicSignerHint[] = [realCandidate, impostorCandidate];

/** A third key with a distinct hint so unmatched rows stay covered. */
export const distinctCandidate: PublicSignerHint = {
  publicKey: Keypair.fromRawEd25519Seed(Buffer.alloc(32, 9)).publicKey(),
  hint: Buffer.from(
    Keypair.fromRawEd25519Seed(Buffer.alloc(32, 9)).signatureHint()
  ).toString("hex")
};
