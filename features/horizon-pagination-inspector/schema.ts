import { err, ok, type Result } from "@/core/result/result";
import { normalizeInput } from "@/core/lib/strings";
import type { HorizonPaginationErrorCode } from "@/features/horizon-pagination-inspector/types";

export function parseHorizonPaginationInput(
  raw: string
): Result<{ input: string; mode: "auto" | "json" | "url" | "link" }, HorizonPaginationErrorCode> {
  const input = normalizeInput(raw);

  if (!input) return err("empty_input");

  let mode: "auto" | "json" | "url" | "link" = "auto";
  if (input.startsWith("{")) mode = "json";
  else if (input.includes("://") || input.startsWith("/")) mode = "url";
  else if (input.includes("</")) mode = "link";

  return ok({ input, mode });
}
