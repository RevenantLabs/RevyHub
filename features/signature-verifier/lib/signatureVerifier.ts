import { err, ok, type Result } from "@/core/result/result";
import { Keypair, StrKey } from "@stellar/stellar-sdk";
import type { StellarNetwork } from "@/core/network/types";
import type { MessageEncoding, SignatureEncoding, SignatureVerifierErrorCode, SignatureVerifierInput, SignatureVerifierResult } from "@/features/signature-verifier/types";

function decode(value: string, encoding: MessageEncoding | SignatureEncoding): Uint8Array | null {
  if (encoding === "utf8") return new TextEncoder().encode(value);
  if (encoding === "hex") {
    if (!/^[0-9a-f]+$/i.test(value) || value.length % 2 !== 0) return null;
    const bytes = new Uint8Array(value.length / 2);
    for (let index = 0; index < bytes.length; index += 1) bytes[index] = Number.parseInt(value.slice(index * 2, index * 2 + 2), 16);
    return bytes;
  }
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(value)) return null;
  let binary: string;
  try { binary = atob(value); } catch { return null; }
  if (!binary.length || btoa(binary).replace(/=+$/, "") !== value.replace(/=+$/, "")) return null;
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

export function verifyEd25519Signature(input: SignatureVerifierInput): Result<SignatureVerifierResult, SignatureVerifierErrorCode> {
  if (!input.publicKey.trim()) return err("empty_public_key");
  if (/^S/i.test(input.publicKey.trim()) || !StrKey.isValidEd25519PublicKey(input.publicKey)) return err("invalid_public_key");
  if (!input.message) return err("empty_message");
  if (!input.signature) return err("empty_signature");
  const message = decode(input.message, input.messageEncoding);
  if (!message) return err(input.messageEncoding === "utf8" ? "invalid_message_encoding" : "invalid_message_encoding");
  const signature = decode(input.signature, input.signatureEncoding);
  if (!signature || signature.length !== 64) return err("invalid_signature_format");
  let verified = false;
  try { verified = Keypair.fromPublicKey(input.publicKey).verify(message, signature); } catch { return err("invalid_signature_format"); }
  return ok({ summary: verified ? "Signature verified locally." : "Signature did not verify.", verified, publicKey: input.publicKey, messageEncoding: input.messageEncoding, signatureEncoding: input.signatureEncoding, signatureBytes: signature.length, explanation: "A valid result proves possession of the private key for this message only; it is not an identity or transaction authorization." });
}

/** Core tool logic. Never throws for expected failures — returns a Result. */
export async function runSignatureVerifier(
  input: SignatureVerifierInput,
  _network: StellarNetwork,
  _signal?: AbortSignal
): Promise<Result<SignatureVerifierResult, SignatureVerifierErrorCode>> {
  return verifyEd25519Signature(input);
}
