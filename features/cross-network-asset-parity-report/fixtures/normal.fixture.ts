import { Keypair } from "@stellar/stellar-sdk"

export const RETRIEVED_AT = "2026-06-01T12:00:00.000Z"
export const leftIssuer = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 1)).publicKey()
export const rightIssuer = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 2)).publicKey()
export const missingIssuer = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 3)).publicKey()
export const downIssuer = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 4)).publicKey()

export function pairRecord(
  id: string,
  left: { network: string; code: string; issuer: string },
  right: { network: string; code: string; issuer: string }
) {
  return { id, left, right }
}

export const matchingPair = pairRecord(
  "pair-usdc",
  { network: "testnet", code: "USDC", issuer: leftIssuer },
  { network: "mainnet", code: "USDC", issuer: rightIssuer }
)

export function pairsJson(pairs: unknown[] = [matchingPair]) {
  return JSON.stringify(pairs)
}

export function accountBody(homeDomain: string, authRequired: boolean) {
  return {
    home_domain: homeDomain,
    last_modified_ledger: 12345,
    flags: {
      auth_required: authRequired,
      auth_revocable: false,
      auth_immutable: false,
      auth_clawback_enabled: false
    }
  }
}

export function assetBody(code: string, issuer: string) {
  return {
    _embedded: {
      records: [{ asset_type: "credit_alphanum4", asset_code: code, asset_issuer: issuer }]
    }
  }
}
