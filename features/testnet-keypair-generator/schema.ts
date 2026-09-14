import { err, ok, type Result } from "@/core/result/result";
import type { KeypairErrorCode } from "@/features/testnet-keypair-generator/types";

export function parseKeypairInput(
  raw: string
): Result<{ mode: "generate" | "derive"; seed?: string }, KeypairErrorCode> {
  const trimmed = raw.trim();

  if (!trimmed) {
    return ok({ mode: "generate" });
  }

  if (trimmed.startsWith("S")) {
    return ok({ mode: "derive", seed: trimmed });
  }

  return err("invalid_seed");
}
