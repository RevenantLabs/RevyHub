import { err, ok, type Result } from "@/core/result/result";

const SERVER_LINE = /^TRANSFER_SERVER_SEP0024\s*=\s*"([^"]+)"/m;

export function stellarTomlUrl(homeDomain: string): string {
  return `https://${homeDomain}/.well-known/stellar.toml`;
}

export function readTransferServer(toml: string): Result<string, "missing_transfer_server" | "request_failed"> {
  const match = toml.match(SERVER_LINE);
  if (!match) return err("missing_transfer_server");
  let url: URL;
  try {
    url = new URL(match[1]);
  } catch {
    return err("request_failed");
  }
  if (url.protocol !== "https:") return err("request_failed");
  return ok(url.toString().replace(/\/$/, ""));
}
