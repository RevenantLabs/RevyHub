import { Keypair } from "@stellar/stellar-sdk";

const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const issuerAccountId = seed(41).publicKey();
export const holderAccountId = seed(42).publicKey();
export const noTrustlineHolderId = seed(43).publicKey();
export const unknownAccountId = seed(44).publicKey();
export const rateLimitedAccountId = seed(45).publicKey();

export const assetCode = "USDC";

export function issuerAccountResponse(accountId: string, authClawbackEnabled: boolean) {
  return {
    id: accountId,
    account_id: accountId,
    sequence: "1",
    subentry_count: 0,
    thresholds: { low_threshold: 0, med_threshold: 0, high_threshold: 0 },
    flags: {
      auth_required: false,
      auth_revocable: true,
      auth_immutable: false,
      auth_clawback_enabled: authClawbackEnabled
    },
    balances: [{ asset_type: "native", balance: "100.0000000" }],
    signers: [{ weight: 1, key: accountId, type: "ed25519_public_key" }],
    data: {},
    num_sponsoring: 0,
    num_sponsored: 0,
    paging_token: accountId,
    _links: { self: { href: "" } }
  };
}

export function holderAccountResponse(
  accountId: string,
  issuerId: string,
  code: string,
  clawbackEnabled: boolean | null
) {
  const balances: unknown[] = [{ asset_type: "native", balance: "50.0000000" }];
  if (clawbackEnabled !== null) {
    balances.push({
      asset_type: "credit_alphanum4",
      asset_code: code,
      asset_issuer: issuerId,
      balance: "10.0000000",
      limit: "1000.0000000",
      is_authorized: true,
      is_authorized_to_maintain_liabilities: true,
      is_clawback_enabled: clawbackEnabled
    });
  }
  return {
    id: accountId,
    account_id: accountId,
    sequence: "1",
    subentry_count: balances.length - 1,
    thresholds: { low_threshold: 0, med_threshold: 0, high_threshold: 0 },
    flags: { auth_required: false, auth_revocable: false, auth_immutable: false, auth_clawback_enabled: false },
    balances,
    signers: [{ weight: 1, key: accountId, type: "ed25519_public_key" }],
    data: {},
    num_sponsoring: 0,
    num_sponsored: 0,
    paging_token: accountId,
    _links: { self: { href: "" } }
  };
}

/** Baseline sample: neither side has clawback enabled. */
export const sample = { issuerAccountId, holderAccountId, assetCode };
