import { err, ok, type Result } from "@/core/result/result";
import type { MemoSignal } from "@/features/memo-required-checker/types";

/**
 * Self-published stellar.toml flag. SEP-29 itself only defines the data entry;
 * this key lets a home domain publish the same requirement beside it.
 */
const POLICY_LINE = /^MEMO_REQUIRED\s*=\s*(true|false)\b/im;

export function readHomeDomain(account: {
  home_domain?: string | null;
}): Result<string | null, "request_failed"> {
  const domain = account.home_domain?.trim().toLowerCase() ?? "";
  if (!domain) return ok(null);
  if (domain.includes("/") || domain.includes(" ") || domain.includes(":")) return err("request_failed");
  return ok(domain);
}

export function stellarTomlUrl(homeDomain: string): string {
  return `https://${homeDomain}/.well-known/stellar.toml`;
}

/** A missing MEMO_REQUIRED key is an absent signal, not an error. */
export function readTomlMemoPolicy(toml: string): Result<MemoSignal, "request_failed"> {
  const match = toml.match(POLICY_LINE);
  if (!match) {
    if (/^MEMO_REQUIRED\s*=/im.test(toml)) return err("request_failed");
    return ok("absent");
  }
  return ok(match[1].toLowerCase() === "true" ? "required" : "not_required");
}
