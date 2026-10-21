import { Keypair } from "@stellar/stellar-sdk";

/**
 * A public key with one alphabet character replaced.
 * Substituting that character back is a checksum the SDK already accepts, so the search must recover it.
 */
const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const originalPublicKey = seed(4).publicKey();
export const typoPosition = 10;
export const originalCharacter = originalPublicKey[typoPosition] ?? "A";
export const replacementCharacter = originalCharacter === "A" ? "C" : "A";

export const singleCharTypo = `${originalPublicKey.slice(0, typoPosition)}${replacementCharacter}${originalPublicKey.slice(typoPosition + 1)}`;

/** Same account with the version byte rewritten to `S`, one edit away from the public key. */
export const seedShapedNearMiss = `S${originalPublicKey.slice(1)}`;
