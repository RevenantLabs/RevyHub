import { err, ok, type Result } from "@/core/result/result";
import { normalizeInput } from "@/core/lib/strings";
import type { SponsoredReservesErrorCode, SponsoredReservesInput } from "@/features/sponsored-reserves/types";

/** Parses raw form input into a validated request, without throwing. */
export function parseSponsoredReservesInput(raw: string): Result<SponsoredReservesInput, SponsoredReservesErrorCode> {
  const value = normalizeInput(raw);
  if (!value) return err("empty_input");
  return ok({ value });
}
