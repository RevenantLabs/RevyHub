import { describe, expect, it } from "vitest";
import { parseEffectsTimelineInput } from "@/features/effects-timeline/schema";
import { accountId, secretSeed } from "@/features/effects-timeline/fixtures/effectsTimeline.fixture";

describe("parseEffectsTimelineInput", () => {
  it("accepts a valid public address", () => {
    expect(parseEffectsTimelineInput(accountId)).toEqual({ ok: true, value: { accountId } });
  });

  it("strips whitespace from a wrapped paste", () => {
    const wrapped = `${accountId.slice(0, 20)}\n  ${accountId.slice(20)}`;
    expect(parseEffectsTimelineInput(wrapped)).toEqual({ ok: true, value: { accountId } });
  });

  it("reports empty input separately from invalid input", () => {
    expect(parseEffectsTimelineInput("")).toEqual({ ok: false, code: "empty_input" });
    expect(parseEffectsTimelineInput("   \n\t ")).toEqual({ ok: false, code: "empty_input" });
  });

  it("rejects a secret seed on its prefix, without echoing it", () => {
    const result = parseEffectsTimelineInput(secretSeed);

    expect(result).toEqual({ ok: false, code: "invalid_address" });
    expect(JSON.stringify(result)).not.toContain(secretSeed);
  });

  it("rejects a value that fails the StrKey checksum", () => {
    // A single mutated character keeps the length and alphabet but breaks the
    // checksum, which is exactly the failure a user cannot see by eye.
    const mutated = `${accountId.slice(0, -1)}${accountId.endsWith("A") ? "B" : "A"}`;

    expect(parseEffectsTimelineInput(mutated)).toEqual({ ok: false, code: "invalid_address" });
  });

  it("rejects lengths either side of a 56-character address", () => {
    expect(accountId).toHaveLength(56);
    expect(parseEffectsTimelineInput(accountId.slice(0, 55))).toEqual({
      ok: false,
      code: "invalid_address"
    });
    expect(parseEffectsTimelineInput(`${accountId}A`)).toEqual({
      ok: false,
      code: "invalid_address"
    });
  });

  it("rejects other StrKey types that are not account addresses", () => {
    // Muxed (M) and contract (C) addresses are valid StrKeys but Horizon's
    // account effects endpoint is keyed by a plain G address.
    expect(parseEffectsTimelineInput(`M${accountId.slice(1)}`)).toEqual({
      ok: false,
      code: "invalid_address"
    });
    expect(parseEffectsTimelineInput(`C${accountId.slice(1)}`)).toEqual({
      ok: false,
      code: "invalid_address"
    });
  });
});
