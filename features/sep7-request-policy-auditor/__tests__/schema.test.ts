import { expect, it } from "vitest";
import { Keypair } from "@stellar/stellar-sdk";
import { Buffer } from "buffer";
import { parseInput } from "../schema";
import { sample } from "../fixtures/sep7RequestPolicyAuditor.fixture";

it("accepts the sample and rejects a secret without echoing it", () => {
  expect(parseInput(sample).ok).toBe(true);
  const seed = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 8)).secret();
  const secret = parseInput({ uri: seed, policy: sample.policy });
  expect(secret).toMatchObject({ ok: false, code: "invalid_uri" });
  expect(JSON.stringify(secret)).not.toContain(seed);
  expect(parseInput({ uri: sample.uri, policy: "" })).toMatchObject({ ok: false, code: "invalid_policy" });
});
