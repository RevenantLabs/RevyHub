import { describe, expect, it } from "vitest";
import { MAX_XDR_LENGTH, parseInput } from "../schema";
import { sample } from "../fixtures/contractDeployPreview.fixture";

describe("parseInput", () => {
  it("accepts a valid envelope", () => {
    expect(parseInput(sample.envelope).ok).toBe(true);
  });

  it("rejects empty input", () => {
    const result = parseInput("   ");
    expect(!result.ok && result.code).toBe("empty_xdr");
  });

  it("rejects text that is not base64", () => {
    const result = parseInput("not base64 at all!!");
    expect(!result.ok && result.code).toBe("invalid_xdr");
  });

  it("rejects input over the length cap", () => {
    const result = parseInput("A".repeat(MAX_XDR_LENGTH + 4));
    expect(!result.ok && result.code).toBe("too_large");
  });

  it("strips whitespace before validating", () => {
    const spaced = sample.envelope.replace(/(.{4})/g, "$1 ");
    expect(parseInput(spaced).ok).toBe(true);
  });
});
