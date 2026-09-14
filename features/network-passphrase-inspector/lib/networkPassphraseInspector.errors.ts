import { classifyHorizonError } from "@/core/horizon/errors";
import type { NetworkPassphraseInspectorErrorCode } from "@/features/network-passphrase-inspector/types";

/** Maps transport failures onto this tool's own error codes. */
export function toNetworkPassphraseInspectorErrorCode(error: unknown): NetworkPassphraseInspectorErrorCode {
  const { code } = classifyHorizonError(error);
  return code === "not_found" ? "not_found" : "request_failed";
}
