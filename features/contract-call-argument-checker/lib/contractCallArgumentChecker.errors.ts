import type { ErrorCode } from "../types";

export function unexpectedFailure(): ErrorCode {
  return "invalid_spec_xdr";
}
