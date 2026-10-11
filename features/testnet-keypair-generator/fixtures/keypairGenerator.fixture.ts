import { Keypair } from "@stellar/stellar-sdk";

const seed1 = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const validPublicKey = seed1(1).publicKey();
export const validSeed = seed1(1).secret();
export const validPublicKey2 = seed1(2).publicKey();
export const validSeed2 = seed1(2).secret();
