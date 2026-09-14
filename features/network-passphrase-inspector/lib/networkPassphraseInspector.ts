import { ok, type Result } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import type { NetworkPassphraseInspectorErrorCode, NetworkPassphraseInspectorInput, NetworkPassphraseInspectorResult } from "@/features/network-passphrase-inspector/types";

/** Core tool logic. Never throws for expected failures — returns a Result. */
export async function runNetworkPassphraseInspector(
  input: NetworkPassphraseInspectorInput,
  _network: StellarNetwork,
  _signal?: AbortSignal
): Promise<Result<NetworkPassphraseInspectorResult, NetworkPassphraseInspectorErrorCode>> {
  return ok({ summary: input.value });
}
