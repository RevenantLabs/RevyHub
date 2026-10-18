import type { AnchorDiscoveryResult } from "@/features/anchor-discovery/types";
import { Keypair } from "@stellar/stellar-sdk";

const issuer = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 2)).publicKey();

export const anchorDiscoveryFixture: AnchorDiscoveryResult = {
  summary: "stellar.toml discovered and SEP service endpoints classified.",
  domain: "anchor.example",
  fetchUrl: "https://anchor.example/.well-known/stellar.toml",
  services: { sep6: true, sep10: true, sep12: false, sep24: true, sep31: false, sep38: true },
  signingKey: issuer,
  networkPassphrase: "Test SDF Network ; September 2015",
  currencies: [{ code: "USDC", issuer }],
  status: "valid"
};
