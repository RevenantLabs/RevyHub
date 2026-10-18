import { err, ok, type Result } from "@/core/result/result";
import type {
  ResultCodeExplainerErrorCode,
  ResultCodeExplainerInput,
  ResultCodeExplainerMode
} from "@/features/result-code-explainer/types";

/**
 * Upper bound for pasted result XDR. Results are tiny compared to envelopes;
 * the cap exists so a pasted file cannot lock the main thread inside the decoder.
 */
export const MAX_RESULT_XDR_LENGTH = 65_536;

const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/;

export interface RawResultCodeExplainerInput {
  mode: ResultCodeExplainerMode;
  value: string;
  search?: string;
}

/** Parses raw form input into a validated request, without throwing. */
export function parseResultCodeExplainerInput(
  raw: RawResultCodeExplainerInput
): Result<ResultCodeExplainerInput, ResultCodeExplainerErrorCode> {
  const value = raw.value.replace(/\s+/g, " ").trim();
  const search = raw.search?.trim() ?? "";

  if (!value) return err("empty_input");

  if (raw.mode === "xdr") {
    const compact = raw.value.replace(/\s+/g, "");
    if (compact.length > MAX_RESULT_XDR_LENGTH) return err("input_too_large");
    if (compact.length % 4 !== 0 || !BASE64.test(compact)) return err("invalid_base64");
    return ok({ mode: "xdr", value: compact, search });
  }

  return ok({ mode: "code", value, search });
}
