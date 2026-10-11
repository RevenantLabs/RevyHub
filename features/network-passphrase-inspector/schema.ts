import { err, ok, type Result } from "@/core/result/result";
import { normalizeInput } from "@/core/lib/strings";
import type { NetworkErrorCode } from "@/features/network-passphrase-inspector/types";

const VALID_TYPES = ["all", "mainnet", "testnet", "futurenet", "custom"];

export interface NetworkSearchInput {
  query: string;
  type: string;
}

export function parseNetworkSearchInput(
  raw: string,
  type: string = "all"
): Result<NetworkSearchInput, NetworkErrorCode> {
  const query = normalizeInput(raw);

  if (type && !VALID_TYPES.includes(type)) {
    return err("invalid_passphrase");
  }

  return ok({ query, type });
}
