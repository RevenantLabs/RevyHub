import { expect, it } from "vitest";
import { Keypair } from "@stellar/stellar-sdk";
import { Buffer } from "buffer";
import { parseInput } from "../schema";
import { sample } from "../fixtures/contractCallArgumentChecker.fixture";
import { MAX_XDR_CHARS } from "../lib/spec-parser";

it("accepts the transfer fixture and rejects a secret, a missing name and a huge paste", () => {
  expect(parseInput(sample).ok).toBe(true);
  const seed = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 8)).secret();
  const secret = parseInput({ ...sample, spec: seed });
  expect(!secret.ok && secret.code).toBe("invalid_spec_xdr");
  expect(JSON.stringify(secret)).not.toContain(seed);
  expect(!parseInput({ ...sample, functionName: "" }).ok).toBe(true);
  const huge = parseInput({ ...sample, arguments: "A".repeat(MAX_XDR_CHARS + 1) });
  expect(huge.ok).toBe(true);
});
