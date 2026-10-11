import { err, ok, type Result } from "@/core/result/result";
import { normalizeInput } from "@/core/lib/strings";
import type { Sep12ErrorCode } from "@/features/sep12-kyc-reference/types";

const VALID_CATEGORIES = ["all", "personal", "entity", "organization"];

export interface Sep12SearchInput {
  query: string;
  category: string;
}

export function parseSep12SearchInput(
  raw: string,
  category: string = "all"
): Result<Sep12SearchInput, Sep12ErrorCode> {
  const query = normalizeInput(raw);

  if (category && !VALID_CATEGORIES.includes(category)) {
    return err("invalid_filter");
  }

  return ok({ query, category });
}
