import { Keypair } from "@stellar/stellar-sdk";

const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

/**
 * The issuer currently has `auth_clawback_enabled`, but this holder's
 * trustline predates that change and still carries `is_clawback_enabled:
 * false` — the two signals disagree, and this tool must say so rather than
 * inferring one from the other.
 */
export const disagreeingIssuerId = seed(61).publicKey();
export const disagreeingHolderId = seed(62).publicKey();
export const disagreeingAssetCode = "OLDX";
