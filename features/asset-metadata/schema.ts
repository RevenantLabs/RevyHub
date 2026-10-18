import { err, ok, type Result } from "@/core/result/result";
import type { AssetMetadataErrorCode, DomainInput } from "@/features/asset-metadata/types";

/**
 * Conservative DNS hostname pattern. A bare IP address is refused: SEP-0001
 * metadata is published by a domain, and an IP cannot be the subject of the
 * trust decision this tool feeds into.
 */
const HOSTNAME =
  /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;
const IPV4 = /^\d{1,3}(?:\.\d{1,3}){3}$/;

/**
 * Normalises user input into a plain HTTPS origin.
 *
 * Any path, query or fragment the user typed is discarded: the caller appends
 * the well-known path itself, so a user cannot steer the request at an
 * arbitrary URL on the host.
 */
export function parseDomainInput(raw: string): Result<DomainInput, AssetMetadataErrorCode> {
  const trimmed = (raw ?? "").trim();

  if (!trimmed) return err("empty_input");
  if (trimmed.startsWith("//")) return err("insecure_scheme");

  const scheme = trimmed.match(/^([a-zA-Z][a-zA-Z\d+\-.]*):\/\//);
  if (scheme && scheme[1].toLowerCase() !== "https") return err("insecure_scheme");

  let parsed: URL;
  try {
    parsed = new URL(trimmed.startsWith("https://") ? trimmed : `https://${trimmed}`);
  } catch {
    return err("invalid_domain");
  }

  if (!parsed.hostname) return err("invalid_domain");
  // Credentials in the URL would be sent to a third-party host.
  if (parsed.username || parsed.password) return err("invalid_domain");
  if (IPV4.test(parsed.hostname) || !HOSTNAME.test(parsed.hostname)) return err("invalid_domain");

  const origin = parsed.port
    ? `${parsed.protocol}//${parsed.hostname}:${parsed.port}`
    : `${parsed.protocol}//${parsed.hostname}`;

  return ok({ origin });
}

export function wellKnownUrl(origin: string): string {
  return `${origin}/.well-known/stellar.toml`;
}
