import { Keypair } from "@stellar/stellar-sdk";

const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const accountId = seed(1).publicKey();
export const issuerId = seed(2).publicKey();
export const otherIssuerId = seed(5).publicKey();
export const unknownAccountId = seed(6).publicKey();

export const MAX_LIMIT = "922337203685.4775807";

export const creditBalances = [
  { asset_type: "native", balance: "100.0000000" },
  {
    asset_type: "credit_alphanum4",
    asset_code: "USDC",
    asset_issuer: issuerId,
    balance: "25.0000000",
    limit: MAX_LIMIT,
    is_authorized: true,
    is_authorized_to_maintain_liabilities: true
  },
  {
    asset_type: "credit_alphanum4",
    asset_code: "EURC",
    asset_issuer: otherIssuerId,
    balance: "0.0000000",
    limit: "1000.0000000",
    is_authorized: false,
    is_authorized_to_maintain_liabilities: true
  }
];

/** Same code, different issuer — the classic "wrong issuer" mistake. */
export const wrongIssuerBalances = [
  { asset_type: "native", balance: "100.0000000" },
  {
    asset_type: "credit_alphanum4",
    asset_code: "USDC",
    asset_issuer: otherIssuerId,
    balance: "5.0000000",
    limit: MAX_LIMIT,
    is_authorized: true,
    is_authorized_to_maintain_liabilities: true
  }
];

export function accountResponse(balances: unknown[]) {
  return {
    id: accountId,
    account_id: accountId,
    sequence: "1",
    subentry_count: balances.length - 1,
    thresholds: { low_threshold: 0, med_threshold: 0, high_threshold: 0 },
    flags: {
      auth_required: false,
      auth_revocable: false,
      auth_immutable: false,
      auth_clawback_enabled: false
    },
    balances,
    signers: [{ weight: 1, key: accountId, type: "ed25519_public_key" }],
    data: {},
    num_sponsoring: 0,
    num_sponsored: 0,
    paging_token: accountId,
    _links: { self: { href: "" } }
  };
}
