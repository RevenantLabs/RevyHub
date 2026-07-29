// Stellar federation address resolution per SEP-0002.
//
// References:
//  - SEP-0002 (federation protocol): https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0002.md
//  - SEP-0001 (stellar.toml): https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0001.md
//
// The resolver pipeline:
//   1. Validate the user input is a syntactically valid federation address
//      (`alice*stellar.org` — name before the first "*", DNS-style domain after).
//   2. Fetch `https://<domain>/.well-known/stellar.toml` and extract a
//      `FEDERATION_SERVER` declaration.
//   3. GET that federation server with `?q=<name*domain>&type=name` and parse
//      the JSON response containing `account_id`, optional `memo_type` / `memo`.
//
// All HTTP requests must use HTTPS. Browser CORS or DNS failures surface as
// `networkError` rather than a non-existent HTTP status (those go through the
// error path via fetch TypeError, which is caught and remapped).

import { StrKey } from "@stellar/stellar-sdk";

const NAME_PATTERN = /^[a-zA-Z0-9._-]+$/;
// Conservative DNS hostname regex: each label is alphanumeric + hyphen, the
// full hostname has at least one dot, and total length stays well under
// the 253-character RFC limit.
const DOMAIN_PATTERN =
  /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
const FEDERATION_SERVER_REGEX =
  /^\s*FEDERATION_SERVER\s*=\s*(?:"([^"]+)"|'([^']+)'|([^"'\s#]+))/m;

const NAME_MAX_LENGTH = 64;
const DEFAULT_TIMEOUT_MS = 8000;
const ALLOWED_MEMO_TYPES = new Set([
  "text",
  "id",
  "hash",
  "return"
]);

export interface FederationAddress {
  name: string;
  domain: string;
}

export type FederationMemoType = "text" | "id" | "hash" | "return";

export interface FederationRecord {
  accountId: string;
  memoType?: FederationMemoType;
  memo?: string;
}

export type FederationErrorCode =
  | "empty"
  | "invalidSyntax"
  | "tomlNotFound"
  | "tomlMalformed"
  | "noFederationServer"
  | "httpsRequired"
  | "federationNotFound"
  | "federationMalformed"
  | "federationServerError"
  | "invalidAccountId"
  | "invalidMemo"
  | "timeout"
  | "networkError";

export interface FederationSuccess {
  kind: "success";
  address: FederationAddress;
  record: FederationRecord;
  federationServer: string;
  tomlUrl: string;
}

export interface FederationError {
  kind: "error";
  code: FederationErrorCode;
  message: string;
  /** Populated whenever validation succeeded — used to preserve the input. */
  address?: FederationAddress;
}

export type FederationResult = FederationSuccess | FederationError;

export interface ResolveFederationOptions {
  /**
   * Optional `fetch` implementation. Defaults to the runtime `fetch`
   * (works in browsers and Node 18+). Useful for tests.
   */
  fetchImpl?: typeof fetch;
  /**
   * AbortSignal that lets the caller cancel an in-flight resolution.
   * Combined with the built-in timeout signal so either source ends the
   * request.
   */
  signal?: AbortSignal;
  /**
   * Maximum time for any single network leg. Defaults to ~8s. The TOML
   * lookup and the federation server call each get the full budget.
   */
  timeoutMs?: number;
}

export interface FederationSyntaxValidation {
  valid: boolean;
  message: string;
  address?: FederationAddress;
}

export function parseFederationAddress(
  raw: string
): FederationAddress | null {
  if (typeof raw !== "string") {
    return null;
  }

  const trimmed = raw.trim();

  if (!trimmed) {
    return null;
  }

  // SEP-0002: "If the string contains multiple *s, the first one separates
  // the name from the domain." Use `indexOf`, not `lastIndexOf`.
  const asteriskIndex = trimmed.indexOf("*");

  if (asteriskIndex < 1) {
    return null;
  }

  const name = trimmed.slice(0, asteriskIndex);
  const domain = trimmed.slice(asteriskIndex + 1);

  if (!name || !domain) {
    return null;
  }
  if (name.length > NAME_MAX_LENGTH) {
    return null;
  }
  if (!NAME_PATTERN.test(name)) {
    return null;
  }
  if (!DOMAIN_PATTERN.test(domain)) {
    return null;
  }

  // Hostnames are case-insensitive; normalise so downstream URL building is
  // deterministic and test snapshots stay stable.
  return { name, domain: domain.toLowerCase() };
}

export function validateFederationSyntax(
  raw: string
): FederationSyntaxValidation {
  const trimmed = (raw ?? "").trim();

  if (!trimmed) {
    return {
      valid: false,
      message:
        "Enter a federation address in the form name*domain (for example, alice*stellar.org)."
    };
  }

  const asteriskIndex = trimmed.indexOf("*");

  if (asteriskIndex < 0) {
    return {
      valid: false,
      message:
        "Federation addresses use the format name*domain, with an asterisk between them."
    };
  }

  const name = trimmed.slice(0, asteriskIndex);
  const domain = trimmed.slice(asteriskIndex + 1);

  if (!name) {
    return {
      valid: false,
      message: "The name part before the asterisk is required."
    };
  }

  if (!domain) {
    return {
      valid: false,
      message: "The domain part after the asterisk is required."
    };
  }

  if (name.length > NAME_MAX_LENGTH) {
    return {
      valid: false,
      message:
        "The name part must be 64 characters or less to fit Stellar federation rules."
    };
  }

  if (!NAME_PATTERN.test(name)) {
    return {
      valid: false,
      message:
        "The name part may only contain letters, digits, dots, underscores, and hyphens."
    };
  }

  if (!DOMAIN_PATTERN.test(domain)) {
    return {
      valid: false,
      message:
        "The domain part must be a valid hostname (for example, stellar.org)."
    };
  }

  return {
    valid: true,
    message: "Looks like a valid federation address.",
    address: { name, domain: domain.toLowerCase() }
  };
}

export async function resolveFederation(
  raw: string,
  options: ResolveFederationOptions = {}
): Promise<FederationResult> {
  const validation = validateFederationSyntax(raw);

  if (!validation.valid) {
    return {
      kind: "error",
      code: raw.trim().length === 0 ? "empty" : "invalidSyntax",
      message: validation.message
    };
  }

  const address = validation.address!;
  const tomlUrl = `https://${address.domain}/.well-known/stellar.toml`;

  let federationServer: string;

  try {
    const discovery = await discoverFederationServer(tomlUrl, options);

    if (!discovery.ok) {
      return {
        kind: "error",
        code: discovery.code,
        message: discovery.message,
        address
      };
    }

    federationServer = discovery.value;
  } catch (err) {
    return mapFetchError(err, address);
  }

  try {
    const query = await queryFederationServer(
      federationServer,
      `${address.name}*${address.domain}`,
      options
    );

    if (!query.ok) {
      return {
        kind: "error",
        code: query.code,
        message: query.message,
        address
      };
    }

    return {
      kind: "success",
      address,
      record: query.value,
      federationServer,
      tomlUrl
    };
  } catch (err) {
    return mapFetchError(err, address);
  }
}

type StepResult<T> =
  | { ok: true; value: T }
  | { ok: false; code: FederationErrorCode; message: string };

async function discoverFederationServer(
  tomlUrl: string,
  options: ResolveFederationOptions
): Promise<StepResult<string>> {
  const response = await safeFetch(tomlUrl, options);

  if (response.status === 0) {
    return stepError(
      "networkError",
      "Could not reach the domain to look up stellar.toml. The server may be offline or missing CORS headers."
    );
  }

  if (response.status === 404) {
    return stepError(
      "tomlNotFound",
      "No stellar.toml file was found at /.well-known/stellar.toml on that domain."
    );
  }

  if (!response.ok) {
    return stepError(
      "tomlNotFound",
      `Could not load stellar.toml (HTTP ${response.status}).`
    );
  }

  const body = await response.text();
  const matched = body.match(FEDERATION_SERVER_REGEX);

  if (!matched) {
    return stepError(
      "noFederationServer",
      "The stellar.toml file does not declare a FEDERATION_SERVER for that domain."
    );
  }

  const federationServer = (matched[1] ?? matched[2] ?? matched[3] ?? "").trim();

  if (!federationServer) {
    return stepError(
      "noFederationServer",
      "The FEDERATION_SERVER value in stellar.toml is empty."
    );
  }

  let parsedFederationServer: URL;

  try {
    parsedFederationServer = new URL(federationServer);
  } catch {
    return stepError(
      "tomlMalformed",
      "The FEDERATION_SERVER value in stellar.toml is not a valid URL."
    );
  }

  if (parsedFederationServer.protocol !== "https:") {
    return stepError(
      "httpsRequired",
      "The federation server URL must use HTTPS."
    );
  }

  return { ok: true, value: federationServer };
}

async function queryFederationServer(
  serverUrl: string,
  federationAddress: string,
  options: ResolveFederationOptions
): Promise<StepResult<FederationRecord>> {
  const url = new URL(serverUrl);
  // SEP-0002 requires a GET with query parameters.
  url.searchParams.set("q", federationAddress);
  url.searchParams.set("type", "name");

  const response = await safeFetch(url.toString(), options);

  if (response.status === 0) {
    return stepError(
      "networkError",
      "Could not reach the federation server. The server may be offline or blocking browser requests."
    );
  }

  if (response.status === 404) {
    return stepError(
      "federationNotFound",
      "The federation server did not find that name on that domain."
    );
  }

  if (!response.ok) {
    return stepError(
      "federationServerError",
      `The federation server returned HTTP ${response.status}.`
    );
  }

  let parsed: unknown;

  try {
    const text = await response.text();
    parsed = JSON.parse(text);
  } catch {
    return stepError(
      "federationMalformed",
      "The federation server returned a response that is not valid JSON."
    );
  }

  if (typeof parsed !== "object" || parsed === null) {
    return stepError(
      "federationMalformed",
      "The federation server returned an unexpected response shape."
    );
  }

  const record = parsed as {
    account_id?: unknown;
    memo_type?: unknown;
    memo?: unknown;
  };

  if (typeof record.account_id !== "string" || !record.account_id) {
    return stepError(
      "federationMalformed",
      "The federation server response is missing an account_id field."
    );
  }

  if (!StrKey.isValidEd25519PublicKey(record.account_id)) {
    return stepError(
      "invalidAccountId",
      "The federation server returned an account_id that is not a valid Stellar public key."
    );
  }

  const memoType =
    typeof record.memo_type === "string" ? record.memo_type : undefined;
  const memo = typeof record.memo === "string" ? record.memo : undefined;

  if (memo !== undefined && memoType === undefined) {
    return stepError(
      "invalidMemo",
      "The federation server returned a memo without memo_type."
    );
  }

  if (memoType !== undefined && !ALLOWED_MEMO_TYPES.has(memoType)) {
    return stepError(
      "invalidMemo",
      `The federation server returned an unsupported memo_type: ${memoType}.`
    );
  }

  if (
    memoType === "text" &&
    memo !== undefined &&
    new TextEncoder().encode(memo).length > 28
  ) {
    return stepError(
      "invalidMemo",
      "Text memos must be 28 UTF-8 bytes or less to fit on a Stellar transaction."
    );
  }

  return {
    ok: true,
    value: {
      accountId: record.account_id,
      memoType: memoType as FederationMemoType | undefined,
      memo
    }
  };
}

async function safeFetch(
  url: string,
  options: ResolveFederationOptions
): Promise<Response> {
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;

  if (typeof fetchImpl !== "function") {
    throw new FederationNetworkError(
      "No fetch implementation is available in this runtime."
    );
  }

  // Respect a caller-provided AbortSignal that already aborted before we even
  // start the request. Without this, a test mock of `fetch` that ignores
  // `signal` would never observe the cancellation. In real implementations
  // this is also the optimial path — don't burn a network round-trip on a
  // request the caller has already given up on.
  if (options.signal?.aborted) {
    throw new FederationTimeoutError();
  }

  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const timeoutSignal = createTimeoutSignal(timeoutMs);
  const signal = combineSignals(options.signal, timeoutSignal);

  try {
    return await fetchImpl(url, { signal });
  } catch (err) {
    if (isAbortError(err)) {
      throw new FederationTimeoutError();
    }
    throw err instanceof FederationTimeoutError
      ? err
      : new FederationNetworkError(err);
  }
}

function createTimeoutSignal(timeoutMs: number): AbortSignal | undefined {
  if (typeof AbortSignal === "undefined") {
    return undefined;
  }
  if (typeof AbortSignal.timeout === "function") {
    return AbortSignal.timeout(timeoutMs);
  }
  // Fallback for runtimes missing AbortSignal.timeout.
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller.signal;
}

function combineSignals(
  userSignal: AbortSignal | undefined,
  timeoutSignal: AbortSignal | undefined
): AbortSignal | undefined {
  if (!userSignal) {
    return timeoutSignal;
  }
  if (!timeoutSignal) {
    return userSignal;
  }
  if (typeof AbortSignal.any === "function") {
    return AbortSignal.any([userSignal, timeoutSignal]);
  }
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  userSignal.addEventListener("abort", onAbort, { once: true });
  timeoutSignal.addEventListener("abort", onAbort, { once: true });
  if (userSignal.aborted || timeoutSignal.aborted) {
    controller.abort();
  }
  return controller.signal;
}

function isAbortError(err: unknown): boolean {
  return (
    err instanceof DOMException
      ? err.name === "AbortError"
      : (err as Error | undefined)?.name === "AbortError"
  );
}

function mapFetchError(
  err: unknown,
  address: FederationAddress
): FederationError {
  if (err instanceof FederationTimeoutError || isAbortError(err)) {
    return {
      kind: "error",
      code: "timeout",
      message: "The federation lookup was cancelled or timed out.",
      address
    };
  }

  return {
    kind: "error",
    code: "networkError",
    message:
      "Could not reach the federation server. The server may be offline or blocking browser requests.",
    address
  };
}

function stepError(code: FederationErrorCode, message: string): StepResult<never> {
  return { ok: false, code, message };
}

export class FederationTimeoutError extends Error {
  constructor() {
    super("Federation lookup timed out");
    this.name = "FederationTimeoutError";
  }
}

export class FederationNetworkError extends Error {
  readonly cause: unknown;
  constructor(cause: unknown) {
    super("Federation network error");
    this.name = "FederationNetworkError";
    this.cause = cause;
  }
}
