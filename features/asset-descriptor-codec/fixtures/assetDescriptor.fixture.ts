import { Keypair } from "@stellar/stellar-sdk";

const seedIssuer = (byte: number) =>
  Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const validIssuer = seedIssuer(1).publicKey();
export const validIssuer2 = seedIssuer(2).publicKey();
export const shortCode = "USD";
export const longCode = "MYTOKEN12345";
export const nativeDescriptor = { kind: "native" as const };
export const issuedDescriptor = {
  kind: "credit_alphanum4" as const,
  code: "USD",
  issuer: validIssuer,
};
