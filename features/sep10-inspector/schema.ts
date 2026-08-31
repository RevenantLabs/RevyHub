import { err, ok, type Result } from "@/core/result/result";
import { normalizeInput } from "@/core/lib/strings";
import type { Sep10InspectorErrorCode, Sep10InspectorInput } from "@/features/sep10-inspector/types";

/** Parses raw form input into a validated request, without throwing. */
export function parseSep10InspectorInput(raw: string): Result<Sep10InspectorInput, Sep10InspectorErrorCode> {
  const value = normalizeInput(raw);
  if (!value) return err("empty_input");
  // The inspector accepts only a base64 transaction envelope, never a secret
  // seed or a signed payload supplied for another purpose.
  if (/^S[A-Z2-7]{10,}$/i.test(value)) return err("invalid_xdr");
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(value)) return err("invalid_xdr");
  return ok({ xdr: value });
}
