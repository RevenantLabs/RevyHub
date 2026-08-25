import { Keypair } from "@stellar/stellar-sdk";
import type { RawPaymentForm } from "@/features/payment-qr/schema";

const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const destination = seed(1).publicKey();
export const issuer = seed(2).publicKey();

export const nativeForm: RawPaymentForm = {
  destination,
  amount: "10.5",
  assetKind: "native",
  assetCode: "",
  assetIssuer: "",
  memo: "",
  msg: ""
};

export const issuedForm: RawPaymentForm = {
  ...nativeForm,
  assetKind: "issued",
  assetCode: "usdc",
  assetIssuer: issuer
};

/** 28 ASCII bytes exactly — the largest memo a text memo can hold. */
export const memoAtLimit = "a".repeat(28);
/** 10 emoji at 4 bytes each = 40 bytes, over the limit despite being short. */
export const memoOverByteLimit = "🚀".repeat(10);
