import type { SignerRotationErrorCode } from "@/features/signer-rotation-impact-auditor/types";

/**
 * This slice is fully offline, so there is no transport failure to classify.
 * Unexpected decode failures that escape a Result path map to malformed_data.
 */
export function toSignerRotationErrorCode(error: unknown): SignerRotationErrorCode {
  void error;
  return "malformed_data";
}

const INPUT_CODES: readonly SignerRotationErrorCode[] = [
  "empty_input",
  "invalid_input",
  "too_large"
];

export function isInputProblem(code: SignerRotationErrorCode): boolean {
  return INPUT_CODES.includes(code);
}

export function isDecodeProblem(code: SignerRotationErrorCode): boolean {
  return code === "malformed_data" || code === "unsupported_variant";
}
