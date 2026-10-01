import { describe, expect, it } from "vitest";
import {
  errorFieldFor,
  parseSponsorshipPlannerInput
} from "@/features/sponsorship-planner/schema";
import {
  newSponsoredAccountId,
  secretSeed,
  sponsoredAccountId,
  sponsorAccountId
} from "@/features/sponsorship-planner/fixtures/sponsorshipPlanner.fixture";

describe("parseSponsorshipPlannerInput", () => {
  it("rejects a missing sponsor", () => {
    expect(parseSponsorshipPlannerInput("  \n ", sponsoredAccountId)).toEqual({
      ok: false,
      code: "empty_sponsor"
    });
  });

  it("rejects a missing sponsored account", () => {
    expect(parseSponsorshipPlannerInput(sponsorAccountId, " \t ")).toEqual({
      ok: false,
      code: "empty_sponsored"
    });
  });

  it("rejects a sponsor with a broken checksum", () => {
    expect(
      parseSponsorshipPlannerInput(sponsorAccountId.slice(0, -1), sponsoredAccountId)
    ).toEqual({
      ok: false,
      code: "invalid_sponsor"
    });
  });

  it("rejects a sponsored account with a broken checksum", () => {
    expect(
      parseSponsorshipPlannerInput(sponsorAccountId, sponsoredAccountId.slice(0, -1))
    ).toEqual({
      ok: false,
      code: "invalid_sponsored"
    });
  });

  it("rejects a secret seed on its prefix without echoing it", () => {
    const result = parseSponsorshipPlannerInput(sponsorAccountId, secretSeed);
    expect(result).toEqual({ ok: false, code: "invalid_sponsored" });
    expect(JSON.stringify(result)).not.toContain(secretSeed);
  });

  it("rejects the same account as both sponsor and sponsored", () => {
    expect(parseSponsorshipPlannerInput(sponsorAccountId, sponsorAccountId)).toEqual({
      ok: false,
      code: "same_account"
    });
  });

  it("accepts checksum-valid addresses with pasted whitespace", () => {
    const result = parseSponsorshipPlannerInput(
      `  ${sponsorAccountId}\n`,
      `${newSponsoredAccountId} `
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toEqual({
      sponsorAccountId,
      sponsoredAccountId: newSponsoredAccountId
    });
  });
});

describe("errorFieldFor", () => {
  it("maps sponsor codes to the sponsor field and network codes to no field", () => {
    expect(errorFieldFor("empty_sponsor")).toBe("sponsor");
    expect(errorFieldFor("invalid_sponsor")).toBe("sponsor");
    expect(errorFieldFor("empty_sponsored")).toBe("sponsored");
    expect(errorFieldFor("invalid_sponsored")).toBe("sponsored");
    expect(errorFieldFor("same_account")).toBeUndefined();
    expect(errorFieldFor("sponsor_not_found")).toBeUndefined();
    expect(errorFieldFor("ledger_unavailable")).toBeUndefined();
    expect(errorFieldFor("rate_limited")).toBeUndefined();
    expect(errorFieldFor("request_failed")).toBeUndefined();
  });
});
