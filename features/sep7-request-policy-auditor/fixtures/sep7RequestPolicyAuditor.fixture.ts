import { Keypair } from "@stellar/stellar-sdk";
import { Buffer } from "buffer";
import { NETWORK_PASSPHRASES } from "@/core/network/config";

export const payee = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 11)).publicKey();
export const stranger = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 12)).publicKey();
export const issuer = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 13)).publicKey();

export const samplePolicy = {
  destinations: [payee],
  minAmount: "1.0000000",
  maxAmount: "25",
  passphrases: [NETWORK_PASSPHRASES.testnet],
  callbackHosts: ["hooks.example"],
  assets: [{ code: "USDC", issuer }],
  memos: ["invoice-1"]
};

export const samplePolicyText = JSON.stringify(samplePolicy);

function query(params: Record<string, string>): string {
  return Object.entries(params).map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join("&");
}

export const sampleUri = `web+stellar:pay?${query({
  destination: payee,
  amount: "10.5",
  asset_code: "USDC",
  asset_issuer: issuer,
  memo: "invoice-1",
  network_passphrase: NETWORK_PASSPHRASES.testnet,
  msg: "Thanks"
})}`;

export const sample = { uri: sampleUri, policy: samplePolicyText };
