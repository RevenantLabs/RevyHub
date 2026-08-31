import type { SignatureVerifierResult } from "@/features/signature-verifier/types";
import { Keypair } from "@stellar/stellar-sdk";

const keypair = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 5));
const message = "revyhub-fixture";
const signature = Buffer.from(keypair.sign(Buffer.from(message))).toString("hex");

export const signatureVerifierFixture: SignatureVerifierResult = {
  summary: "Signature verified locally.",
  verified: true,
  publicKey: keypair.publicKey(),
  messageEncoding: "utf8",
  signatureEncoding: "hex",
  signatureBytes: 64,
  explanation: "A valid result proves possession of the private key for this message only; it is not an identity or transaction authorization."
};

export const signatureVerifierInput = {
  publicKey: keypair.publicKey(),
  message,
  signature,
  messageEncoding: "utf8" as const,
  signatureEncoding: "hex" as const
};
