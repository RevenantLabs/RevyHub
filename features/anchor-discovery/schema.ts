import { err, ok, type Result } from "@/core/result/result";
import { normalizeInput } from "@/core/lib/strings";
import type { AnchorDiscoveryErrorCode, AnchorDiscoveryInput } from "@/features/anchor-discovery/types";

/** Parses raw form input into a validated request, without throwing. */
export function parseAnchorDiscoveryInput(raw: string): Result<AnchorDiscoveryInput, AnchorDiscoveryErrorCode> {
  const value = normalizeInput(raw);
  if (!value) return err("empty_input");
  if (/^http:\/\//i.test(value)) return err("insecure_domain");
  const candidate = /^https:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(candidate);
    if (url.protocol !== "https:") return err("insecure_domain");
    if (!url.hostname || url.hostname.includes("_") || url.hostname === "localhost" || url.hostname.includes("/")) return err("invalid_domain");
    return ok({ domain: url.hostname.toLowerCase() });
  } catch {
    return err("invalid_domain");
  }
}
