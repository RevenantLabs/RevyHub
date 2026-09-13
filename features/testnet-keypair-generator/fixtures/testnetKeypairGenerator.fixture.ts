import { Keypair } from "@stellar/stellar-sdk";
import type { TestnetKeypairGeneratorResult } from "@/features/testnet-keypair-generator/types";

// Rule 8: Derive fixtures deterministically rather than hand-typing
export const deterministicSeedBuffer = Buffer.alloc(32, 7);
const derivedKeypair = Keypair.fromRawEd25519Seed(deterministicSeedBuffer);

export const testnetKeypairGeneratorFixture: TestnetKeypairGeneratorResult = {
  publicKey: derivedKeypair.publicKey(),
  secretSeed: derivedKeypair.secret(),
  label: "Fixture Testnet Account",
  network: "testnet",
  networkCheckStatus: "unfunded",
  friendbotUrl: `https://friendbot.stellar.org/?addr=${derivedKeypair.publicKey()}`,
  generatedAt: "2026-09-13T12:00:00.000Z"
};
