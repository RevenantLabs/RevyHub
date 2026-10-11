import { classifyHorizonError } from "@/core/horizon/errors";
import type { TestnetKeypairGeneratorErrorCode } from "@/features/testnet-keypair-generator/types";

/** Maps transport failures onto this tool's own error codes. */
export function toTestnetKeypairGeneratorErrorCode(error: unknown): TestnetKeypairGeneratorErrorCode {
  const { code } = classifyHorizonError(error);
  return code === "not_found" ? "not_found" : "request_failed";
}
