import { err, ok, type Result } from "@/core/result/result";
import type { Sep7SignatureVerifierErrorCode, Sep7SignatureVerifierInput } from "@/features/sep7-signature-verifier/types";

const DOMAIN_PATTERN = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

function unsignedUriAndParams(uri: string) {
  const question = uri.indexOf("?");
  if (question < 0) return { unsignedUri: uri, params: [] as Array<[string, string]> };
  const prefix = uri.slice(0, question);
  const query = uri.slice(question + 1);
  const kept: string[] = [];
  const params: Array<[string, string]> = [];
  for (const segment of query.split("&")) {
    if (!segment) continue;
    const equals = segment.indexOf("=");
    const rawKey = equals < 0 ? segment : segment.slice(0, equals);
    const rawValue = equals < 0 ? "" : segment.slice(equals + 1);
    let key = rawKey;
    let value = rawValue;
    try {
      key = decodeURIComponent(rawKey.replace(/\+/g, " "));
      value = decodeURIComponent(rawValue.replace(/\+/g, " "));
    } catch {
      // Keep malformed percent-encoding for the verifier to reject as invalid.
    }
    params.push([key, value]);
    if (key !== "signature") kept.push(segment);
  }
  return { unsignedUri: `${prefix}?${kept.join("&")}`, params };
}

/** Parses raw form input into a validated request, without throwing. */
export function parseSep7SignatureVerifierInput(raw: string): Result<Sep7SignatureVerifierInput, Sep7SignatureVerifierErrorCode> {
  // Only strip paste-boundary whitespace: changing bytes inside the URI would
  // make an otherwise valid SEP-0007 signature fail verification.
  const value = (raw ?? "").trim();
  if (!value) return err("empty_input");
  if (!value.startsWith("web+stellar:")) return err("wrong_scheme");

  const parsed = unsignedUriAndParams(value);
  const signatures = parsed.params.filter(([key]) => key === "signature");
  if (!signatures.length || !signatures[0][1]) return err("no_signature");
  const origins = parsed.params.filter(([key]) => key === "origin_domain");
  const originDomain = origins[0]?.[1]?.trim().toLowerCase();
  if (!originDomain || !DOMAIN_PATTERN.test(originDomain)) return err("no_origin_domain");

  return ok({ uri: value, originDomain, signature: signatures[0][1], unsignedUri: parsed.unsignedUri });
}

export { unsignedUriAndParams };
