import { Keypair, xdr } from "@stellar/stellar-sdk";
export const claimantA = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 21)).publicKey();
export const claimantB = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 22)).publicKey();
export const deadline = "2026-11-23T12:00:00Z";
export const before = "2026-11-23T11:59:59Z";
export const after = "2026-11-23T12:00:01Z";
export const balance = {
  id: "00".repeat(36), asset: "native", amount: "922337203685.4775807",
  claimants: [
    { destination: claimantA, predicate: { not: { abs_before: deadline } } },
    { destination: claimantB, predicate: { unconditional: true } }
  ]
};
export const balanceJson = JSON.stringify(balance);
export const predicateXdr = xdr.ClaimPredicate.claimPredicateNot(
  xdr.ClaimPredicate.claimPredicateBeforeAbsoluteTime(xdr.Int64.fromString("1795435200"))
).toXDR("base64");
