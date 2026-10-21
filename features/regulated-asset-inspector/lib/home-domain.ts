import { err, ok, type Result } from "@/core/result/result";

export function readHomeDomain(account: {
  home_domain?: string | null;
}): Result<string, "missing_home_domain"> {
  const domain = account.home_domain?.trim().toLowerCase() ?? "";
  if (!domain || domain.includes("/") || domain.includes(" ")) return err("missing_home_domain");
  return ok(domain);
}

export function stellarTomlUrl(homeDomain: string): string {
  return `https://${homeDomain}/.well-known/stellar.toml`;
}
