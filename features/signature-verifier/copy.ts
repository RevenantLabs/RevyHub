import type { SignatureVerifierErrorCode } from "@/features/signature-verifier/types";

export const copy = {
  formLabel: "Verification request JSON",
  formHint: "Provide publicKey, message, signature, messageEncoding (utf8/hex/base64) and signatureEncoding (hex/base64). Nothing is uploaded.",
  submit: "Verify signature",
  emptyTitle: "No signature verified",
  emptyDescription: "Verify an Ed25519 signature locally and see whether it proves possession for the supplied message.",
  resultTitle: "Ed25519 verification"
} as const;

export const errorCopy: Record<SignatureVerifierErrorCode, { title: string; description: string }> = {
  empty_input: { title: "Enter a verification request", description: "Provide the JSON fields for the public key, message, signature and encodings." },
  empty_public_key: { title: "Public key is missing", description: "Provide a Stellar G... public key; secret seeds are never accepted." },
  invalid_public_key: { title: "Public key is invalid", description: "Use a checksummed Stellar Ed25519 public key, not a secret seed." },
  empty_message: { title: "Message is missing", description: "Provide the exact message bytes that were signed." },
  empty_signature: { title: "Signature is missing", description: "Provide the 64-byte Ed25519 signature." },
  invalid_signature_format: { title: "Signature format is invalid", description: "Choose hex or base64 and provide exactly 64 decoded bytes." },
  invalid_message_encoding: { title: "Message encoding is invalid", description: "Use UTF-8 text, even-length hex, or canonical base64." },
  request_failed: { title: "Verification did not complete", description: "Check the JSON fields and encoding values." }
};
