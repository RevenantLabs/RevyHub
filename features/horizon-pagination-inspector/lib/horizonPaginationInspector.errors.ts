import type { PaginationErrorCode } from "@/features/horizon-pagination-inspector/types";

/**
 * This slice makes no request, so there is no transport failure to classify.
 *
 * The reader is a total function over its input: every expected problem is
 * already a code from inspectPagination. Anything reaching this fallback is a
 * defect in this slice rather than something the user did, and reporting it as
 * unreadable input is the honest answer — there is no network layer to blame.
 */
export function toHorizonPaginationInspectorErrorCode(error: unknown): PaginationErrorCode {
  void error;
  return "not_json";
}

/** Codes caused by the pasted text rather than by the collection it describes. */
const INPUT_CODES: readonly PaginationErrorCode[] = ["empty_input", "input_too_large"];

export function isInputProblem(code: PaginationErrorCode): boolean {
  return INPUT_CODES.includes(code);
}

/** Codes that mean "this is not a Horizon collection response at all". */
const SHAPE_CODES: readonly PaginationErrorCode[] = [
  "not_json",
  "not_an_object",
  "missing_records",
  "records_not_an_array"
];

export function isShapeProblem(code: PaginationErrorCode): boolean {
  return SHAPE_CODES.includes(code);
}
