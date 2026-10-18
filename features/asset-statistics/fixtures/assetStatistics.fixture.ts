import { Keypair } from "@stellar/stellar-sdk";

const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const assetCode = "REVY";
export const unknownAssetCode = "NOPE";
export const issuerId = seed(41).publicKey();
export const secretSeed = seed(42).secret();

export const assetRecord = {
  _links: { toml: { href: "" } },
  asset_type: "credit_alphanum4",
  asset_code: assetCode,
  asset_issuer: issuerId,
  paging_token: `${assetCode}_${issuerId}_credit_alphanum4`,
  accounts: {
    authorized: 12_345,
    authorized_to_maintain_liabilities: 12,
    unauthorized: 8
  },
  balances: {
    authorized: "9007199254740993.1234567",
    authorized_to_maintain_liabilities: "6.0000001",
    unauthorized: "0.8765432"
  },
  num_claimable_balances: 4,
  claimable_balances_amount: "100.0000001",
  num_liquidity_pools: 2,
  liquidity_pools_amount: "50.9999999",
  num_contracts: 3,
  contracts_amount: "25.0000000",
  flags: {
    auth_required: true,
    auth_revocable: false,
    auth_immutable: false,
    auth_clawback_enabled: true
  }
};

export function assetCollection(records: unknown[]) {
  return {
    _links: {
      self: { href: "" },
      next: { href: "" },
      prev: { href: "" }
    },
    _embedded: { records }
  };
}
