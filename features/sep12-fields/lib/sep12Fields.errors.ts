import type { Sep12FieldsErrorCode } from "@/features/sep12-fields/types";

/**
 * This slice makes no request and parses no external document, so there is no
 * transport failure to classify and no decode that can throw. The search runs
 * over a table compiled into the bundle, which means the only failure a user
 * can cause is an oversized query and that is already an error code by the
 * time anything calls this.
 *
 * The fallback therefore reports the one code that exists rather than
 * inventing a family of codes this slice never produces.
 */
export function toSep12FieldsErrorCode(error: unknown): Sep12FieldsErrorCode {
  void error;
  return "query_too_long";
}
