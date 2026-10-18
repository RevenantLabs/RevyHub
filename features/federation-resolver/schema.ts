import { err, ok, type Result } from "@/core/result/result";
import type { FederationAddress, FederationErrorCode } from "@/features/federation-resolver/types";

const NAME_PATTERN = /^[a-zA-Z0-9._-]+$/;

/**
 * Conservative DNS hostname pattern: each label is alphanumeric plus hyphen,
 * the hostname has at least one dot, and every label stays inside the 63-octet
 * limit.
 */
const DOMAIN_PATTERN =
  /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export const NAME_MAX_LENGTH = 64;

/**
 * Parses `name*domain` into its parts.
 *
 * SEP-0002: "If the string contains multiple *s, the first one separates the
 * name from the domain." That is why this splits on `indexOf`, not
 * `lastIndexOf` — a name may legitimately contain further asterisks.
 *
 * Hostnames are case-insensitive, so the domain is lower-cased to keep every
 * URL this slice builds deterministic.
 */
export function parseFederationInput(raw: string): Result<FederationAddress, FederationErrorCode> {
  const trimmed = (raw ?? "").trim();

  if (!trimmed) return err("empty_input");

  const separator = trimmed.indexOf("*");
  if (separator < 1) return err("invalid_syntax");

  const name = trimmed.slice(0, separator);
  const domain = trimmed.slice(separator + 1);

  if (!name || !domain) return err("invalid_syntax");
  if (name.length > NAME_MAX_LENGTH) return err("invalid_syntax");
  if (!NAME_PATTERN.test(name)) return err("invalid_syntax");
  if (!DOMAIN_PATTERN.test(domain)) return err("invalid_syntax");

  return ok({ name, domain: domain.toLowerCase() });
}

/** The canonical `name*domain` string sent to a federation server. */
export function formatFederationAddress(address: FederationAddress): string {
  return `${address.name}*${address.domain}`;
}
