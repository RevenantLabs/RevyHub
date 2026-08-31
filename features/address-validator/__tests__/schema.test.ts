import { describe, expect, it } from "vitest";
import { parseAddressInput } from "@/features/address-validator/schema";
import { validPublicKey } from "@/features/address-validator/fixtures/addressValidator.fixture";

describe("parseAddressInput", () => {
  it("rejects an empty value", () => {
    expect(parseAddressInput("")).toEqual({ ok: false, code: "empty_input" });
  });

  it("rejects a whitespace-only value", () => {
    expect(parseAddressInput("   \n\t ")).toEqual({ ok: false, code: "empty_input" });
  });

  it("strips whitespace introduced by wrapped terminal output", () => {
    const wrapped = `${validPublicKey.slice(0, 20)}\n  ${validPublicKey.slice(20)}`;
    const result = parseAddressInput(wrapped);

    expect(result.ok && result.value.address).toBe(validPublicKey);
  });
});
