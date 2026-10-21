import { Keypair } from "@stellar/stellar-sdk";
import { MEMO_REQUIRED_KEY } from "@/features/memo-required-checker/lib/memo-required-flag";

const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const accountId = seed(3).publicKey();
export const homeDomain = "exchange.example";
export const tomlUrl = `https://${homeDomain}/.well-known/stellar.toml`;
export const requiredValue = btoa("1");
export const malformedValue = btoa("2");

export function accountRecord(options: {
  data?: Record<string, string>;
  homeDomain?: string | null;
} = {}) {
  return {
    id: accountId,
    account_id: accountId,
    sequence: "1",
    home_domain: options.homeDomain === undefined ? homeDomain : options.homeDomain,
    data: options.data ?? { [MEMO_REQUIRED_KEY]: requiredValue }
  };
}

export const requiredToml = "MEMO_REQUIRED = true\n";
export const declinedToml = "MEMO_REQUIRED = false\n";
export const silentToml = "VERSION = \"2.0.0\"\n";
