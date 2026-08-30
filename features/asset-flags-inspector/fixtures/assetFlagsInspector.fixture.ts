import { Keypair } from "@stellar/stellar-sdk";
import type {
  AssetFlagsInspectorResult,
  IssuerAuthorizationFlags
} from "@/features/asset-flags-inspector/types";
import { buildCallouts, buildSummary } from "@/features/asset-flags-inspector/lib/format";

const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const issuerId = seed(1).publicKey();
export const restrictedIssuerId = seed(2).publicKey();
export const clawbackIssuerId = seed(3).publicKey();
export const immutableIssuerId = seed(4).publicKey();
export const unknownIssuerId = seed(5).publicKey();

export const noFlags: IssuerAuthorizationFlags = {
  authRequired: false,
  authRevocable: false,
  authClawbackEnabled: false,
  authImmutable: false
};

export const restrictedFlags: IssuerAuthorizationFlags = {
  authRequired: true,
  authRevocable: true,
  authClawbackEnabled: false,
  authImmutable: false
};

export const clawbackFlags: IssuerAuthorizationFlags = {
  authRequired: false,
  authRevocable: true,
  authClawbackEnabled: true,
  authImmutable: false
};

export const immutableFlags: IssuerAuthorizationFlags = {
  authRequired: true,
  authRevocable: true,
  authClawbackEnabled: true,
  authImmutable: true
};

export function toHorizonFlags(flags: IssuerAuthorizationFlags) {
  return {
    auth_required: flags.authRequired,
    auth_revocable: flags.authRevocable,
    auth_clawback_enabled: flags.authClawbackEnabled,
    auth_immutable: flags.authImmutable
  };
}

export function issuerAccountResponse(id: string, flags: IssuerAuthorizationFlags) {
  return {
    id,
    account_id: id,
    sequence: "1",
    subentry_count: 0,
    thresholds: { low_threshold: 0, med_threshold: 0, high_threshold: 0 },
    flags: toHorizonFlags(flags),
    balances: [{ asset_type: "native", balance: "100.0000000" }],
    signers: [{ weight: 1, key: id, type: "ed25519_public_key" }],
    data: {},
    num_sponsoring: 0,
    num_sponsored: 0,
    paging_token: id,
    _links: { self: { href: "" } }
  };
}

export function assetFlagsInspectorFixture(
  id: string,
  flags: IssuerAuthorizationFlags
): AssetFlagsInspectorResult {
  return {
    issuerId: id,
    flags,
    summary: buildSummary(flags),
    callouts: buildCallouts(flags)
  };
}

export const ordinaryIssuerFixture = assetFlagsInspectorFixture(issuerId, noFlags);
export const restrictedIssuerFixture = assetFlagsInspectorFixture(restrictedIssuerId, restrictedFlags);
export const clawbackIssuerFixture = assetFlagsInspectorFixture(clawbackIssuerId, clawbackFlags);
export const immutableIssuerFixture = assetFlagsInspectorFixture(immutableIssuerId, immutableFlags);
