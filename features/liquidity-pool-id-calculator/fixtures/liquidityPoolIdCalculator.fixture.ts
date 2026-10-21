import { Keypair } from "@stellar/stellar-sdk";

const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const issuerId = seed(71).publicKey();

/** Native XLM paired with an issued asset — the most common real-world pool shape. */
export const sample = {
  assetXCode: "USDC",
  assetXIssuer: issuerId,
  assetYCode: "",
  assetYIssuer: "",
  feeBps: "30"
};

export const otherIssuerId = seed(72).publicKey();
