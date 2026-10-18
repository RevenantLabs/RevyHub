import { Keypair } from "@stellar/stellar-sdk";
import type { RawBalance } from "../lib/claimant-pages";
const account = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte)).publicKey();
export const claimant = account(11);
export const otherClaimant = account(12);
export const issuer = account(13);
export const beforeBalance: RawBalance = {
  id: "a".repeat(64), paging_token: "100", amount: "125.5000000", asset: `USD:${issuer}`,
  claimants: [{ destination: claimant, predicate: { abs_before: "2026-10-01T00:00:00Z", abs_before_epoch: "1790812800" } }]
};
export const relativeBalance: RawBalance = {
  id: "b".repeat(64), paging_token: "101", amount: "0.0000001", asset: "native",
  claimants: [{ destination: claimant, predicate: { rel_before: "86400" } }]
};
export const normalPage = { _embedded: { records: [beforeBalance, relativeBalance] } };
