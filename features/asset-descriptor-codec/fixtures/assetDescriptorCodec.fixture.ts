import { Asset, Keypair } from "@stellar/stellar-sdk";

/** Derives deterministic Ed25519 keypairs from fixed 32-byte seeds. */
const deriveKeypair = (byte: number): Keypair =>
  Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const keypairA = deriveKeypair(1);
export const keypairB = deriveKeypair(2);
export const keypairSecret = deriveKeypair(99);

export const issuerA = keypairA.publicKey();
export const issuerB = keypairB.publicKey();
export const secretSeed = keypairSecret.secret();

export const nativeFixture = {
  mode: "encode" as const,
  raw: "native",
  code: "XLM",
  issuer: null,
  canonicalDescriptor: "native",
  type: "native" as const,
  xdr: Asset.native().toXDRObject().toXDR("base64")
};

export const credit4Fixture = {
  mode: "encode" as const,
  code: "USDC",
  issuer: issuerA,
  raw: `USDC:${issuerA}`,
  canonicalDescriptor: `USDC:${issuerA}`,
  type: "credit_alphanum4" as const,
  xdr: new Asset("USDC", issuerA).toXDRObject().toXDR("base64")
};

export const credit12Fixture = {
  mode: "encode" as const,
  code: "LONGASSET12",
  issuer: issuerB,
  raw: `LONGASSET12:${issuerB}`,
  canonicalDescriptor: `LONGASSET12:${issuerB}`,
  type: "credit_alphanum12" as const,
  xdr: new Asset("LONGASSET12", issuerB).toXDRObject().toXDR("base64")
};

export const creditXlmFixture = {
  mode: "encode" as const,
  code: "XLM",
  issuer: issuerA,
  raw: `XLM:${issuerA}`,
  canonicalDescriptor: `XLM:${issuerA}`,
  type: "credit_alphanum4" as const,
  xdr: new Asset("XLM", issuerA).toXDRObject().toXDR("base64")
};

export const boundariesFixture = {
  singleChar: {
    code: "A",
    raw: `A:${issuerA}`,
    expectedType: "credit_alphanum4" as const
  },
  fourChars: {
    code: "TEST",
    raw: `TEST:${issuerA}`,
    expectedType: "credit_alphanum4" as const
  },
  fiveChars: {
    code: "TOKEN",
    raw: `TOKEN:${issuerA}`,
    expectedType: "credit_alphanum12" as const
  },
  twelveChars: {
    code: "TWELVECHARS1",
    raw: `TWELVECHARS1:${issuerA}`,
    expectedType: "credit_alphanum12" as const
  },
  thirteenChars: {
    code: "THIRTEENCHARS",
    raw: `THIRTEENCHARS:${issuerA}`
  }
};

export const trailingBytesXdrFixture = Buffer.concat([
  Buffer.from("AAAAAA==", "base64"),
  Buffer.from([0, 0, 0, 1])
]).toString("base64");

export const poolShareXdrFixture = Buffer.from([0, 0, 0, 3]).toString("base64");
