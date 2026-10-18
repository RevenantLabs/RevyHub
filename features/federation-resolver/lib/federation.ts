import { StrKey } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import {
  DEFAULT_TIMEOUT_MS,
  FederationNetworkError,
  FederationTimeoutError,
  combineSignals,
  createTimeoutSignal,
  isAbortError,
  toFederationErrorCode
} from "@/features/federation-resolver/lib/federation.errors";
import { formatFederationAddress } from "@/features/federation-resolver/schema";
import type {
  FederationAddress,
  FederationErrorCode,
  FederationMemoType,
  FederationRecord,
  FederationResolution
} from "@/features/federation-resolver/types";

const FEDERATION_SERVER_REGEX =
  /^\s*FEDERATION_SERVER\s*=\s*(?:"([^"]+)"|'([^']+)'|([^"'\s#]+))/m;

const ALLOWED_MEMO_TYPES = new Set<FederationMemoType>(["text", "id", "hash", "return"]);

/** A text memo is limited to 28 UTF-8 bytes, not 28 characters. */
const TEXT_MEMO_MAX_BYTES = 28;

export interface ResolveOptions {
  /** Injectable fetch, used by tests. Defaults to the runtime `fetch`. */
  fetchImpl?: typeof fetch;
  signal?: AbortSignal;
  timeoutMs?: number;
}

export function tomlUrlFor(domain: string): string {
  return `https://${domain}/.well-known/stellar.toml`;
}

async function safeFetch(url: string, options: ResolveOptions): Promise<Response> {
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;

  if (typeof fetchImpl !== "function") {
    throw new FederationNetworkError("No fetch implementation is available in this runtime.");
  }

  // Honour a signal that already aborted, so a caller that has given up never
  // costs a round trip — and so a test fetch that ignores `signal` still sees
  // the cancellation.
  if (options.signal?.aborted) throw new FederationTimeoutError();

  const signal = combineSignals(
    options.signal,
    createTimeoutSignal(options.timeoutMs ?? DEFAULT_TIMEOUT_MS)
  );

  try {
    return await fetchImpl(url, { signal });
  } catch (error) {
    if (isAbortError(error)) throw new FederationTimeoutError();
    throw error instanceof FederationTimeoutError ? error : new FederationNetworkError(error);
  }
}

/**
 * Step 1 — read the domain's stellar.toml and extract `FEDERATION_SERVER`.
 *
 * The server URL is never guessed from the domain: SEP-0002 requires it to be
 * declared, and inventing one would send a name to a host that never claimed
 * to answer for it.
 */
export async function discoverFederationServer(
  domain: string,
  options: ResolveOptions
): Promise<Result<string, FederationErrorCode>> {
  const response = await safeFetch(tomlUrlFor(domain), options);

  if (response.status === 0) return err("network_error");
  if (response.status === 404) return err("toml_not_found");
  if (!response.ok) return err("toml_not_found");

  const matched = (await response.text()).match(FEDERATION_SERVER_REGEX);
  if (!matched) return err("no_federation_server");

  const federationServer = (matched[1] ?? matched[2] ?? matched[3] ?? "").trim();
  if (!federationServer) return err("no_federation_server");

  let parsed: URL;
  try {
    parsed = new URL(federationServer);
  } catch {
    return err("toml_malformed");
  }

  // A federation server is a third-party endpoint named by a third-party file.
  // Plaintext would expose the name being resolved, so HTTPS is required.
  if (parsed.protocol !== "https:") return err("https_required");

  return ok(federationServer);
}

/** Step 2 — ask that server for the name, and validate everything it returns. */
export async function queryFederationServer(
  serverUrl: string,
  address: FederationAddress,
  options: ResolveOptions
): Promise<Result<FederationRecord, FederationErrorCode>> {
  const url = new URL(serverUrl);
  url.searchParams.set("q", formatFederationAddress(address));
  url.searchParams.set("type", "name");

  const response = await safeFetch(url.toString(), options);

  if (response.status === 0) return err("network_error");
  if (response.status === 404) return err("name_not_found");
  if (!response.ok) return err("federation_server_error");

  let parsed: unknown;
  try {
    parsed = JSON.parse(await response.text());
  } catch {
    return err("federation_malformed");
  }

  if (typeof parsed !== "object" || parsed === null) return err("federation_malformed");

  const record = parsed as { account_id?: unknown; memo_type?: unknown; memo?: unknown };

  if (typeof record.account_id !== "string" || !record.account_id) {
    return err("federation_malformed");
  }
  if (!StrKey.isValidEd25519PublicKey(record.account_id)) return err("invalid_account_id");

  const memoType = typeof record.memo_type === "string" ? record.memo_type : undefined;
  const memo = typeof record.memo === "string" ? record.memo : undefined;

  // A memo without its type cannot be attached to a transaction, so it is a
  // malformed answer rather than an optional field.
  if (memo !== undefined && memoType === undefined) return err("invalid_memo");
  if (memoType !== undefined && !ALLOWED_MEMO_TYPES.has(memoType as FederationMemoType)) {
    return err("invalid_memo");
  }
  if (
    memoType === "text" &&
    memo !== undefined &&
    new TextEncoder().encode(memo).length > TEXT_MEMO_MAX_BYTES
  ) {
    return err("invalid_memo");
  }

  return ok({
    accountId: record.account_id,
    memoType: memoType as FederationMemoType | undefined,
    memo
  });
}

export async function resolveFederation(
  address: FederationAddress,
  options: ResolveOptions = {}
): Promise<Result<FederationResolution, FederationErrorCode>> {
  let federationServer: string;

  try {
    const discovery = await discoverFederationServer(address.domain, options);
    if (!discovery.ok) return discovery;
    federationServer = discovery.value;
  } catch (error) {
    return err(toFederationErrorCode(error));
  }

  try {
    const query = await queryFederationServer(federationServer, address, options);
    if (!query.ok) return query;

    return ok({
      address,
      record: query.value,
      federationServer,
      tomlUrl: tomlUrlFor(address.domain)
    });
  } catch (error) {
    return err(toFederationErrorCode(error));
  }
}
