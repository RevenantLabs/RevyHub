import { Keypair } from "@stellar/stellar-sdk";
const key = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte)).publicKey();
export const accountA = key(41);
export const accountB = key(42);
export const accountC = key(43);
export const issuerA = key(44);
export const issuerB = key(45);
export const accountInput = `${accountA}\n${accountB}`;
export const firstResponse = {
  account_id: accountA,
  balances: [
    { asset_type: "native", balance: "100.0000001" },
    { asset_type: "credit_alphanum4", asset_code: "USD", asset_issuer: issuerA, balance: "922337203685.4775807" },
    { asset_type: "credit_alphanum4", asset_code: "USD", asset_issuer: issuerB, balance: "2.0000000" }
  ]
};
export const secondResponse = {
  account_id: accountB,
  balances: [
    { asset_type: "native", balance: "0.9999999" },
    { asset_type: "credit_alphanum4", asset_code: "USD", asset_issuer: issuerA, balance: "0.0000001" },
    { asset_type: "liquidity_pool_shares", balance: "3.0000000", liquidity_pool_id: "0".repeat(64) }
  ]
};
