import { err, ok, type Result } from "@/core/result/result";
import type { SignatureVerifierErrorCode, SignatureVerifierInput } from "@/features/signature-verifier/types";

/** Parses raw form input into a validated request, without throwing. */
export function parseSignatureVerifierInput(raw: string): Result<SignatureVerifierInput, SignatureVerifierErrorCode> {
  const value = raw.trim();
  if (!value) return err("empty_input");
  let parsed: Partial<SignatureVerifierInput>;
  try { parsed = JSON.parse(value) as Partial<SignatureVerifierInput>; } catch { return err("invalid_signature_format"); }
  if (!parsed.publicKey?.trim()) return err("empty_public_key");
  if (/^S/i.test(parsed.publicKey.trim())) return err("invalid_public_key");
  if (!parsed.message) return err("empty_message");
  if (!parsed.signature) return err("empty_signature");
  if (!["utf8", "hex", "base64"].includes(parsed.messageEncoding ?? "")) return err("invalid_message_encoding");
  if (!["hex", "base64"].includes(parsed.signatureEncoding ?? "")) return err("invalid_signature_format");
  return ok({ publicKey: parsed.publicKey.trim(), message: parsed.message, signature: parsed.signature, messageEncoding: parsed.messageEncoding!, signatureEncoding: parsed.signatureEncoding! });
}
