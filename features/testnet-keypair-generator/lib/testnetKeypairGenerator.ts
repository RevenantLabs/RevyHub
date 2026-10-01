import { Keypair } from "@stellar/stellar-sdk";
import { ok, err, type Result } from "@/core/result/result";
import { HORIZON_URLS, FRIENDBOT_URL } from "@/core/network/config";
import { toTestnetKeypairGeneratorErrorCode } from "@/features/testnet-keypair-generator/lib/testnetKeypairGenerator.errors";
import type {
  NetworkCheckStatus,
  TestnetKeypairGeneratorErrorCode,
  TestnetKeypairGeneratorInput,
  TestnetKeypairGeneratorResult
} from "@/features/testnet-keypair-generator/types";

export interface GenerateKeypairOptions {
  deterministicSeed?: Buffer;
}

/**
 * Generates a fresh testnet keypair client-side.
 *
 * Never transmits or stores the private seed. If network check is enabled,
 * only the public key is sent to testnet Horizon to verify account freshness.
 */
export async function generateTestnetKeypair(
  input: TestnetKeypairGeneratorInput,
  signal?: AbortSignal,
  options?: GenerateKeypairOptions
): Promise<Result<TestnetKeypairGeneratorResult, TestnetKeypairGeneratorErrorCode>> {
  let keypair: Keypair;
  try {
    keypair = options?.deterministicSeed
      ? Keypair.fromRawEd25519Seed(options.deterministicSeed)
      : Keypair.random();
  } catch {
    return err("request_failed");
  }

  const publicKey = keypair.publicKey();
  const secretSeed = keypair.secret();

  let networkCheckStatus: NetworkCheckStatus = "skipped";

  if (input.checkNetwork !== false) {
    try {
      const horizonUrl = `${HORIZON_URLS.testnet}/accounts/${publicKey}`;
      const response = await fetch(horizonUrl, { signal });

      if (response.status === 404) {
        networkCheckStatus = "unfunded";
      } else if (response.ok) {
        networkCheckStatus = "funded";
      } else if (response.status === 429) {
        return err("rate_limited");
      } else if (response.status >= 500) {
        return err("horizon_unavailable");
      } else {
        return err("request_failed");
      }
    } catch (error) {
      if (signal?.aborted) {
        throw error;
      }
      return err(toTestnetKeypairGeneratorErrorCode(error));
    }
  }

  const friendbotUrl = `${FRIENDBOT_URL}/?addr=${publicKey}`;

  return ok({
    publicKey,
    secretSeed,
    label: input.label,
    network: "testnet",
    networkCheckStatus,
    friendbotUrl,
    generatedAt: new Date().toISOString()
  });
}
