import { Buffer } from "node:buffer";
import { Keypair, StrKey } from "@stellar/stellar-sdk";

const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const keypair1 = seed(1);
export const validBaseAddress1 = keypair1.publicKey();

export const keypair2 = seed(2);
export const validBaseAddress2 = keypair2.publicKey();

export const secretSeed = seed(3).secret();

/** Helper to derive deterministic M-address for fixtures */
function deriveMuxed(baseAddress: string, id: bigint): string {
  const pubkey = StrKey.decodeEd25519PublicKey(baseAddress);
  const idBuf = Buffer.alloc(8);
  idBuf.writeBigUInt64BE(id);
  return StrKey.encodeMed25519PublicKey(Buffer.concat([pubkey, idBuf]));
}

export const zeroId = "0";
export const muxedAddressZeroId = deriveMuxed(validBaseAddress1, 0n);

export const smallId = "42";
export const muxedAddressSmallId = deriveMuxed(validBaseAddress1, 42n);

export const largeId = "123456789012345678";
export const muxedAddressLargeId = deriveMuxed(validBaseAddress1, 123456789012345678n);

export const maxUint64Id = "18446744073709551615";
export const muxedAddressMaxId = deriveMuxed(validBaseAddress1, 18446744073709551615n);

export const invalidMuxedAddress =
  "MA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJUAAAAAAAAAAAAGZF9";

export const invalidBaseAddress =
  "GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSG9";

export const negativeId = "-1";
export const floatId = "12.34";
export const nonNumericId = "xyz";
export const overflowId = "18446744073709551616";
