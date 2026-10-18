import { classifyHorizonError } from "@/core/horizon/errors";
import type {
  LedgerFetchErrorCode,
  PreconditionsErrorCode
} from "@/features/preconditions-explainer/types";

/** Carries an HTTP status so `classifyHorizonError` can read it back. */
export class HorizonStatusError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`Horizon returned HTTP ${status}`);
    this.name = "HorizonStatusError";
    this.status = status;
  }
}

/**
 * Splits ledger-snapshot failures into the two codes this tool exposes.
 *
 * `request_failed` is reserved for the failures that are worth retrying
 * unchanged — 5xx, a dropped connection, a timeout. Everything else means the
 * snapshot itself is not available from this endpoint on this network, which
 * is a different thing to tell the reader, so it gets `ledger_unavailable`.
 */
export function toLedgerFetchErrorCode(error: unknown): LedgerFetchErrorCode {
  const { code } = classifyHorizonError(error);

  if (code === "server_error" || code === "network_unavailable" || code === "timeout") {
    return "request_failed";
  }

  return "ledger_unavailable";
}

const ENVELOPE_CODES: readonly PreconditionsErrorCode[] = [
  "empty_input",
  "invalid_xdr",
  "no_preconditions"
];

/**
 * True for codes caused by the pasted envelope rather than by the network.
 *
 * The panel uses this to decide whether a failure replaces the answer or only
 * degrades it: a bad envelope has no answer, a missing ledger still does.
 */
export function isEnvelopeProblem(code: PreconditionsErrorCode): boolean {
  return ENVELOPE_CODES.includes(code);
}
