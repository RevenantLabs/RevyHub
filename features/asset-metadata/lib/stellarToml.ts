import { err, ok, type Result } from "@/core/result/result";
import { wellKnownUrl } from "@/features/asset-metadata/schema";
import { parseCurrencies } from "@/features/asset-metadata/lib/tomlParser";
import { toAssetMetadataErrorCode } from "@/features/asset-metadata/lib/stellarToml.errors";
import type {
  AssetMetadataErrorCode,
  DomainInput,
  TomlResult
} from "@/features/asset-metadata/types";

/** 100 KiB. A stellar.toml is a few kilobytes; anything larger is not one. */
export const MAX_TOML_BYTES = 100 * 1024;
export const FETCH_TIMEOUT_MS = 10_000;

export interface FetchTomlOptions {
  fetchImpl?: typeof fetch;
  signal?: AbortSignal;
}

/**
 * Fetches and parses a domain's stellar.toml.
 *
 * Redirects are **not followed**. A redirect would move the request to a host
 * the user never named, and SEP-0001 metadata is only meaningful when it comes
 * from the domain being asked about — so a redirect is reported rather than
 * chased.
 */
export async function fetchStellarToml(
  { origin }: DomainInput,
  options: FetchTomlOptions = {}
): Promise<Result<TomlResult, AssetMetadataErrorCode>> {
  const fetchUrl = wellKnownUrl(origin);
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  options.signal?.addEventListener("abort", () => controller.abort(), { once: true });

  let response: Response;
  try {
    response = await fetchImpl(fetchUrl, {
      signal: controller.signal,
      redirect: "manual",
      headers: { Accept: "text/plain, text/x-toml, */*" }
    });
  } catch (error) {
    return err(toAssetMetadataErrorCode(error));
  } finally {
    clearTimeout(timeout);
  }

  if (
    response.type === "opaqueredirect" ||
    response.redirected ||
    (response.status >= 300 && response.status < 400)
  ) {
    return err("redirect_refused");
  }

  if (response.status === 404) return err("toml_not_found");
  if (!response.ok) return err("server_error");

  const declaredLength = response.headers.get("content-length");
  if (declaredLength && Number(declaredLength) > MAX_TOML_BYTES) {
    return err("response_too_large");
  }

  let rawToml: string;
  try {
    rawToml = await response.text();
  } catch {
    return err("network_error");
  }

  // A server can under-report or omit content-length, so the real body is
  // measured too.
  if (new TextEncoder().encode(rawToml).byteLength > MAX_TOML_BYTES) {
    return err("response_too_large");
  }

  try {
    return ok({
      fetchUrl,
      fetchedAt: new Date().toISOString(),
      currencies: parseCurrencies(rawToml),
      rawToml
    });
  } catch {
    return err("toml_malformed");
  }
}
