import { expect, it } from "vitest";
import { Keypair } from "@stellar/stellar-sdk";
import { Buffer } from "buffer";
import { parseInput } from "../schema";
import { sample } from "../fixtures/contractCodeHashVerifier.fixture";

it("accepts a contract ID and rejects a secret before any request", () => {
  expect(parseInput(sample).ok).toBe(true);
  const seed = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 8)).secret();
  const secret = parseInput({ contractId: seed });
  expect(!secret.ok && secret.code).toBe("invalid_contract_id");
  expect(JSON.stringify(secret)).not.toContain(seed);
  expect(parseInput({ contractId: "CABC" }).ok).toBe(false);
});
