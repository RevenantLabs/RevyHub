import type { AnchorDiscoveryErrorCode } from "@/features/anchor-discovery/types";

/** Maps transport failures onto this tool's own error codes. */
export function toAnchorDiscoveryErrorCode(error: unknown): AnchorDiscoveryErrorCode {
  return error instanceof Error && error.name === "AbortError" ? "toml_unreachable" : "request_failed";
}
