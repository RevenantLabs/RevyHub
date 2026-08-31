import { Keypair, StrKey } from "@stellar/stellar-sdk";

/**
 * Deterministic StrKey samples.
 *
 * Every value is derived from a fixed raw seed rather than hard-coded, so the
 * checksums are always correct and every machine sees the same addresses.
 */
const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const validPublicKey = seed(1).publicKey();
export const secondPublicKey = seed(2).publicKey();

/** Never used as input to anything that echoes a value back. */
export const secretSeed = seed(3).secret();

export const contractAddress = StrKey.encodeContract(Buffer.alloc(32, 7));

export const muxedAddress = StrKey.encodeMed25519PublicKey(
  Buffer.concat([StrKey.decodeEd25519PublicKey(validPublicKey), Buffer.alloc(8, 0)])
);

export const preAuthTxAddress = StrKey.encodePreAuthTx(Buffer.alloc(32, 9));
export const sha256HashAddress = StrKey.encodeSha256Hash(Buffer.alloc(32, 11));

export const truncatedPublicKey = validPublicKey.slice(0, -1);
export const mistypedPublicKey = `${validPublicKey.slice(0, -1)}${
  validPublicKey.endsWith("A") ? "B" : "A"
}`;
export const unknownPrefix = "ZABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUV";
