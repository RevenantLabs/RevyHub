import type { SignatureVerifierErrorCode } from "@/features/signature-verifier/types";

/** Maps transport failures onto this tool's own error codes. */
export function toSignatureVerifierErrorCode(error: unknown): SignatureVerifierErrorCode {
  return error instanceof Error && error.message.includes("encoding") ? "invalid_message_encoding" : "request_failed";
}
