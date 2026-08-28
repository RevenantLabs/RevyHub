import { describe, expect, it } from "vitest";
import { parseSponsoredReservesInput } from "@/features/sponsored-reserves/schema";
import { accountId } from "@/features/sponsored-reserves/fixtures/sponsoredReserves.fixture";

describe("parseSponsoredReservesInput", () => {
  it("accepts a valid account ID", () => {
    const result = parseSponsoredReservesInput(accountId);
    expect(result.ok).toBe(true);
  });

  it("rejects an empty input", () => {
    const result = parseSponsoredReservesInput("   ");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("empty_input");
  });

  it("rejects a secret key", () => {
    const result = parseSponsoredReservesInput("SA...");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("invalid_address");
  });

  it("rejects an invalid public key", () => {
    const result = parseSponsoredReservesInput("GBINVALID...");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("invalid_address");
  });
});
