import { describe, expect, it } from "vitest";
import { Keypair } from "@stellar/stellar-sdk";
import { Buffer } from "buffer";
import { parseInput } from "../schema";
import { sample } from "../fixtures/liquidityPoolIdCalculator.fixture";
import { aboveMaxFee, belowMinFee, maxFee, minFee, nonIntegerFee } from "../fixtures/boundary-fee.fixture";

describe("parseInput", () => {
  it("accepts a valid issued-asset/native pair", () => {
    expect(parseInput(sample).ok).toBe(true);
  });

  it("accepts the boundary fees 0 and 10000", () => {
    expect(parseInput(minFee).ok).toBe(true);
    expect(parseInput(maxFee).ok).toBe(true);
  });

  it("rejects a fee outside [0, 10000]", () => {
    expect(!parseInput(belowMinFee).ok && parseInput(belowMinFee).ok === false).toBe(true);
    const below = parseInput(belowMinFee);
    expect(!below.ok && below.code).toBe("invalid_fee");
    const above = parseInput(aboveMaxFee);
    expect(!above.ok && above.code).toBe("invalid_fee");
  });

  it("rejects a non-integer fee", () => {
    const result = parseInput(nonIntegerFee);
    expect(!result.ok && result.code).toBe("invalid_fee");
  });

  it("rejects a secret key on an issuer field before any computation", () => {
    const seed = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 8)).secret();
    const result = parseInput({ ...sample, assetXIssuer: seed });
    expect(!result.ok && result.code).toBe("invalid_asset");
    expect(JSON.stringify(result)).not.toContain(seed);
  });

  it("rejects an invalid asset code", () => {
    const result = parseInput({ ...sample, assetXCode: "THIRTEENCHARS" });
    expect(!result.ok && result.code).toBe("invalid_asset");
  });

  it("treats a blank code and issuer as the native asset", () => {
    const result = parseInput({ ...sample, assetYCode: "", assetYIssuer: "" });
    expect(result.ok && result.value.assetY.isNative).toBe(true);
  });
});
