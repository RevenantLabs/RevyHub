import type { ErrorCode } from "../types";

/** This slice makes no request — computation is synchronous and local. */
export function unexpectedFailure(): ErrorCode {
  return "invalid_asset";
}
