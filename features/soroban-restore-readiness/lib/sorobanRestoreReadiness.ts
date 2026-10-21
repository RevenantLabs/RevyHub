import { err, ok, type Result } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import { classifyLiveness } from "./archival-classify";
import { fetchEntryState } from "./entry-state-fetch";
import { describeRestoreRequirement } from "./restore-requirements";
import type { ErrorCode, ParsedInput, ReadinessReport } from "../types";

/** Core tool logic. Never throws for expected failures — returns a Result. */
export async function runSorobanRestoreReadiness(
  input: ParsedInput,
  network: StellarNetwork,
  signal?: AbortSignal
): Promise<Result<ReadinessReport, ErrorCode>> {
  const fetched = await fetchEntryState(input.contractId, input.storageKeyXdr, input.durability, network, signal);
  if (!fetched.ok) return fetched;

  if (fetched.value.entries.length === 0 && input.durability === "persistent") {
    return err("entry_not_found");
  }

  const liveness = classifyLiveness(fetched.value, input.durability);
  const restore = describeRestoreRequirement(input.contractId, input.storageKeyXdr, input.durability, liveness);

  return ok({
    contractId: input.contractId,
    storageKeyXdr: input.storageKeyXdr,
    durability: input.durability,
    network,
    latestLedger: fetched.value.latestLedger,
    liveness,
    restore
  });
}
