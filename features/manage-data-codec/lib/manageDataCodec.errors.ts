import type { ManageDataErrorCode } from "@/features/manage-data-codec/types";

/**
 * This slice makes no request, so there is no transport failure to classify.
 * Anything unexpected escaping the encoder is input the SDK refused.
 */
export function toManageDataErrorCode(error: unknown): ManageDataErrorCode {
  void error;
  return "invalid_input";
}

/** Codes the name field is responsible for. */
export function isNameProblem(code: ManageDataErrorCode): boolean {
  return code === "empty_input" || code === "name_too_long";
}

/** Codes the value field is responsible for. */
export function isValueProblem(code: ManageDataErrorCode): boolean {
  return code === "value_too_long" || code === "invalid_encoding";
}

/**
 * True when a bound was exceeded, as opposed to the input being unreadable.
 * The advice differs: one is "shorten it", the other is "it is not that
 * encoding at all".
 */
export function isLengthProblem(code: ManageDataErrorCode): boolean {
  return code === "name_too_long" || code === "value_too_long";
}
