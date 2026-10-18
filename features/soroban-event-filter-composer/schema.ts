import type { Result } from "@/core/result/result";
import type { ErrorCode, EventFilterInput, RawInput } from "./types";
import { buildEventFilter } from "./lib/filter-builder";
import type { StellarNetwork } from "@/core/network/types";

export function parseInput(raw: RawInput, network?: StellarNetwork): Result<EventFilterInput, ErrorCode> {
  return buildEventFilter({
    contractIds: raw.contractIds ?? "",
    eventType: raw.eventType || "All",
    topics: raw.topics ?? "",
    startLedger: raw.startLedger ?? "",
    cursor: raw.cursor ?? "",
    limit: raw.limit ?? "",
    cursorNetwork: raw.cursorNetwork,
    network
  });
}

export function containsSecret(value: string): boolean {
  return /^S[A-Z2-7]{55}$/.test(value.trim());
}
