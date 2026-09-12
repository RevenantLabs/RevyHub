import { describe, expect, it } from "vitest";
import { isErr, isOk } from "@/core/result/result";
import { parseStrkeyInspectorInput } from "@/features/strkey-inspector/schema";
import {
  secretSeed,
  validPublicKey
} from "@/features/strkey-inspector/fixtures/strkeyInspector.fixture";

describe("parseStrkeyInspectorInput", () => {
  it("rejects an empty input with empty_input", () => {
    const result = parseStrkeyInspectorInput("");
    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.code).toBe("empty_input");
    }
  });

  it("rejects whitespace-only input with empty_input", () => {
    const result = parseStrkeyInspectorInput("   \n\t  ");
    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.code).toBe("empty_input");
    }
  });

  it("rejects a secret seed immediately with secret_seed_rejected", () => {
    const result = parseStrkeyInspectorInput(secretSeed);
    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.code).toBe("secret_seed_rejected");
    }
  });

  it("strips whitespace around and within valid input", () => {
    const padded = `  ${validPublicKey.slice(0, 10)}  ${validPublicKey.slice(10)}  `;
    const result = parseStrkeyInspectorInput(padded);
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.value).toBe(validPublicKey);
    }
  });
});
