import type { SignatureHintAuditorErrorCode } from "@/features/signature-hint-auditor/types";

/**
 * This slice makes no request, so there is no transport failure to classify.
 * Anything unexpected escaping the decoder is treated as undecodable XDR.
 */
export function toSignatureHintAuditorErrorCode(
  error: unknown
): SignatureHintAuditorErrorCode {
  void error;
  return "invalid_xdr";
}

/** Codes caused by what was typed, rather than by the envelope's contents. */
const INPUT_CODES: readonly SignatureHintAuditorErrorCode[] = [
  "empty_xdr",
  "invalid_public_signer",
  "too_many_signers"
];

export function isInputProblem(code: SignatureHintAuditorErrorCode): boolean {
  return INPUT_CODES.includes(code) || code === "invalid_xdr";
}

export function isUnsupportedEnvelope(code: SignatureHintAuditorErrorCode): boolean {
  return code === "unsupported_envelope";
}
