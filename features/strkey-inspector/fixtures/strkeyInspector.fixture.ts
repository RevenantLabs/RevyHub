import { Keypair, StrKey } from "@stellar/stellar-sdk";

/**
 * Deterministic StrKey samples derived from fixed raw seeds.
 */
const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const validPublicKey = seed(1).publicKey();
export const secretSeed = seed(3).secret();

export const contractAddress = StrKey.encodeContract(Buffer.alloc(32, 7));

const muxedIdBuf = Buffer.alloc(8);
muxedIdBuf.writeBigUInt64BE(42n, 0);
export const muxedAddress = StrKey.encodeMed25519PublicKey(
  Buffer.concat([StrKey.decodeEd25519PublicKey(validPublicKey), muxedIdBuf])
);

export const preAuthTxAddress = StrKey.encodePreAuthTx(Buffer.alloc(32, 9));
export const sha256HashAddress = StrKey.encodeSha256Hash(Buffer.alloc(32, 11));

const payload = Buffer.from("test", "utf8");
const payloadLen = Buffer.alloc(4);
payloadLen.writeUInt32BE(payload.length, 0);
export const signedPayloadAddress = StrKey.encodeSignedPayload(
  Buffer.concat([StrKey.decodeEd25519PublicKey(validPublicKey), payloadLen, payload])
);

export const truncatedPublicKey = validPublicKey.slice(0, -1);
export const mistypedPublicKey = `${validPublicKey.slice(0, -1)}${
  validPublicKey.endsWith("A") ? "B" : "A"
}`;
export const unknownPrefix = "ZABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUV";
