import { ok, type Result } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import type { SponsoredReservesErrorCode, SponsoredReservesInput, SponsoredReservesResult } from "@/features/sponsored-reserves/types";

/** Core tool logic. Never throws for expected failures — returns a Result. */
export async function runSponsoredReserves(
  input: SponsoredReservesInput,
  _network: StellarNetwork,
  _signal?: AbortSignal
): Promise<Result<SponsoredReservesResult, SponsoredReservesErrorCode>> {
  return ok({ summary: input.value });
}
