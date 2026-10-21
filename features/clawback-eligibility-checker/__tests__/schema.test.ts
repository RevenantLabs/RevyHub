import { describe, expect, it } from "vitest";
import { Keypair } from "@stellar/stellar-sdk";
import { Buffer } from "buffer";
import { parseInput } from "../schema";
import { sample } from "../fixtures/clawbackEligibilityChecker.fixture";

describe("parseInput", () => {
  it("accepts valid input", () => {
    expect(parseInput(sample).ok).toBe(true);
  });

  it("rejects a secret key on either account field before any request", () => {
    const seed = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 9)).secret();
    const result = parseInput({ issuerAccountId: seed, holderAccountId: sample.holderAccountId, assetCode: sample.assetCode });
    expect(!result.ok && result.code).toBe("invalid_account");
    expect(JSON.stringify(result)).not.toContain(seed);
  });

  it("rejects a malformed account id", () => {
    const result = parseInput({ issuerAccountId: "GABC", holderAccountId: sample.holderAccountId, assetCode: sample.assetCode });
    expect(!result.ok && result.code).toBe("invalid_account");
  });

  it("rejects an empty or over-length asset code", () => {
    expect(parseInput({ ...sample, assetCode: "" }).ok).toBe(false);
    expect(parseInput({ ...sample, assetCode: "THIRTEENCHARS" }).ok).toBe(false);
  });
});
