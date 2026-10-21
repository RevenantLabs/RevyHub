import { Keypair } from "@stellar/stellar-sdk";

const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const issuerId = seed(2).publicKey();
export const otherIssuerId = seed(5).publicKey();
export const homeDomain = "issuer.example";
export const tomlUrl = `https://${homeDomain}/.well-known/stellar.toml`;

export const regulatedToml = `
[[CURRENCIES]]
code = "USDC"
issuer = "${issuerId}"
regulated = true
approval_server = "https://issuer.example/approve"
approval_criteria = "KYC required before transfer"
`;

export const unregulatedToml = `
[[CURRENCIES]]
code = "USDC"
issuer = "${issuerId}"
name = "Example USD"
`;

export const malformedToml = `
[[CURRENCIES]]
code = "USDC
`;

export const accountRecord = {
  id: issuerId,
  account_id: issuerId,
  sequence: "1",
  subentry_count: 0,
  home_domain: homeDomain,
  thresholds: { low_threshold: 0, med_threshold: 0, high_threshold: 0 },
  flags: {
    auth_required: true,
    auth_revocable: false,
    auth_immutable: false,
    auth_clawback_enabled: false
  },
  balances: [{ asset_type: "native", balance: "1.0000000" }],
  signers: [{ weight: 1, key: issuerId, type: "ed25519_public_key" }],
  data: {},
  num_sponsoring: 0,
  num_sponsored: 0,
  paging_token: issuerId,
  _links: { self: { href: "" } }
};
