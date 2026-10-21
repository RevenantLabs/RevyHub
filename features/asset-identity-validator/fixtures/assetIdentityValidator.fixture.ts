import { Keypair, StrKey } from "@stellar/stellar-sdk";

/**
 * Deterministic accounts.
 *
 * Addresses come from fixed seeds so the checksum is real and stable.
 * `secretSeed` is only for rejection tests. It must never be rendered.
 */
const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const issuer = seed(4).publicKey();
export const secondIssuer = seed(5).publicKey();
export const secretSeed = seed(6).secret();

export const validCode = "USDC";
export const canonical = `${validCode}:${issuer}`;

export const wrappedIssuer = `${issuer.slice(0, 28)}\n  ${issuer.slice(28)}`;
export const truncatedIssuer = issuer.slice(0, -1);
export const lowerPrefixIssuer = `g${issuer.slice(1)}`;

export const contractAddress = StrKey.encodeContract(Buffer.alloc(32, 8));
export const muxedAddress = StrKey.encodeMed25519PublicKey(
  Buffer.concat([StrKey.decodeEd25519PublicKey(issuer), Buffer.alloc(8, 1)])
);
