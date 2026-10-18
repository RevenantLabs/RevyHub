import type {ErrorCode} from "../types";
/** Offline failures have no transport fallback; decoding errors stay local. */
export function unexpectedFailure(): ErrorCode {return "invalid_input";}
