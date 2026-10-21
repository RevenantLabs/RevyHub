import { Keypair } from "@stellar/stellar-sdk";

const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

/** Both the issuer and the holder's own flag agree: clawback-eligible. */
export const eligibleIssuerId = seed(51).publicKey();
export const eligibleHolderId = seed(52).publicKey();
export const eligibleAssetCode = "EURX";
