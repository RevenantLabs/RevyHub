import { err, ok, type Result } from "@/core/result/result";
import { getPublic, type QuoteFetchOptions } from "@/features/sep38-quote-viewer/lib/sep38QuoteViewer.errors";
import { parseHomeDomain } from "@/features/sep38-quote-viewer/schema";
import type { Sep38QuoteViewerErrorCode } from "@/features/sep38-quote-viewer/types";

const TOML_LINE = /^([A-Za-z0-9_-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^#\s]+))\s*(?:#.*)?$/;

export interface ResolvedQuoteServer {
  homeDomain: string;
  tomlUrl: string;
  quoteServer: string;
}

export function tomlUrlFor(homeDomain: string): string {
  return `https://${homeDomain}/.well-known/stellar.toml`;
}

export function normalizeQuoteServer(value: string): Result<string, "request_failed"> {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return err("request_failed");
  }

  if (url.protocol !== "https:" || url.username || url.password) return err("request_failed");

  const host = url.hostname.toLowerCase();
  if (
    !host ||
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host === "127.0.0.1" ||
    host === "0.0.0.0" ||
    host === "::1"
  ) {
    return err("request_failed");
  }

  url.hash = "";
  url.search = "";
  const trimmedPath = url.pathname.replace(/\/+$/, "");
  url.pathname = trimmedPath === "" ? "/" : trimmedPath;
  const serialized = url.toString();
  return ok(serialized.endsWith("/") ? serialized.slice(0, -1) : serialized);
}

/** Read ANCHOR_QUOTE_SERVER. A missing key is distinct from a broken URL. */
export function readAnchorQuoteServer(
  toml: string
): Result<string, "missing_quote_server" | "request_failed"> {
  let found: string | undefined;

  for (const line of toml.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("[")) continue;
    const match = TOML_LINE.exec(trimmed);
    if (!match) continue;
    if (match[1].toUpperCase() !== "ANCHOR_QUOTE_SERVER") continue;
    found = (match[2] ?? match[3] ?? match[4] ?? "").trim();
  }

  if (found === undefined || found === "") return err("missing_quote_server");
  return normalizeQuoteServer(found);
}

/**
 * Resolve the anchor quote server from stellar.toml.
 * An invalid home domain never produces a request.
 */
export async function resolveQuoteServer(
  homeDomain: string,
  options: QuoteFetchOptions = {}
): Promise<Result<ResolvedQuoteServer, Sep38QuoteViewerErrorCode>> {
  const domain = parseHomeDomain(homeDomain);
  if (!domain.ok) return domain;

  const tomlUrl = tomlUrlFor(domain.value);
  const response = await getPublic(tomlUrl, { ...options, accept: "text/plain, text/x-toml" });
  if (!response.ok) return response;
  if (response.value.status !== 200) return err("request_failed");

  const quoteServer = readAnchorQuoteServer(response.value.body);
  if (!quoteServer.ok) return quoteServer;

  return ok({ homeDomain: domain.value, tomlUrl, quoteServer: quoteServer.value });
}
