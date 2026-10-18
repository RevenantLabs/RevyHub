import { Keypair } from "@stellar/stellar-sdk";

const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const accountId = seed(1).publicKey();
export const issuerId = seed(2).publicKey();
export const unknownAccountId = seed(4).publicKey();

/** A realistic Horizon `/accounts/{id}` payload, trimmed to what this tool reads. */
export const accountResponse = {
  _links: { self: { href: "" } },
  id: accountId,
  account_id: accountId,
  sequence: "4370426197114881",
  subentry_count: 3,
  last_modified_ledger: 1017696,
  last_modified_time: "2026-05-02T10:14:05Z",
  thresholds: { low_threshold: 0, med_threshold: 0, high_threshold: 0 },
  flags: {
    auth_required: false,
    auth_revocable: false,
    auth_immutable: false,
    auth_clawback_enabled: false
  },
  balances: [
    {
      balance: "1250.5000000",
      asset_type: "native",
      buying_liabilities: "0.0000000",
      selling_liabilities: "10.0000000"
    },
    {
      balance: "42.0000000",
      limit: "922337203685.4775807",
      asset_type: "credit_alphanum4",
      asset_code: "USDC",
      asset_issuer: issuerId,
      buying_liabilities: "0.0000000",
      selling_liabilities: "0.0000000",
      is_authorized: true,
      is_authorized_to_maintain_liabilities: true,
      last_modified_ledger: 1017690
    },
    {
      balance: "3.1400000",
      limit: "922337203685.4775807",
      asset_type: "liquidity_pool_shares",
      liquidity_pool_id: "dd7b1ab831c273310ddbec6f97870aa83c2fbd78ce22aded37ecbf4f3380fac7",
      last_modified_ledger: 1017688
    }
  ],
  signers: [{ weight: 1, key: accountId, type: "ed25519_public_key" }],
  data: {},
  num_sponsoring: 0,
  num_sponsored: 0,
  paging_token: accountId
};

/** Same account with an unauthorized credit line, for the badge path. */
export const unauthorizedAccountResponse = {
  ...accountResponse,
  balances: [
    accountResponse.balances[0],
    { ...accountResponse.balances[1], is_authorized: false }
  ]
};

export const emptyBalancesResponse = { ...accountResponse, balances: [] };
