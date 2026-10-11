import { ok, type Result } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import type { TestnetKeypairGeneratorErrorCode, TestnetKeypairGeneratorInput, TestnetKeypairGeneratorResult } from "@/features/testnet-keypair-generator/types";

/** Core tool logic. Never throws for expected failures — returns a Result. */
export async function runTestnetKeypairGenerator(
  input: TestnetKeypairGeneratorInput,
  _network: StellarNetwork,
  _signal?: AbortSignal
): Promise<Result<TestnetKeypairGeneratorResult, TestnetKeypairGeneratorErrorCode>> {
  return ok({ summary: input.value });
}
