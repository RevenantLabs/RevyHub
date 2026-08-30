import { describe, expect, it } from "vitest";
import { formatDuplicateLines, formatLineReason, formatSummary } from "@/features/batch-address-validator/lib/format";
import { batchAddressValidatorFixture } from "@/features/batch-address-validator/fixtures/batchAddressValidator.fixture";

describe("formatSummary", () => {
  it("joins valid, invalid and duplicated counts", () => {
    expect(formatSummary(batchAddressValidatorFixture.summary)).toBe("3 valid · 1 invalid · 2 duplicated");
  });

  it("includes secret key count when present", () => {
    expect(
      formatSummary({
        total: 2,
        valid: 1,
        invalid: 1,
        duplicated: 0,
        secretSeeds: 1
      })
    ).toBe("1 valid · 1 invalid · 0 duplicated · 1 secret key rejected");
  });
});

describe("formatLineReason", () => {
  it("labels valid rows", () => {
    expect(formatLineReason("valid")).toBe("Valid Stellar public address");
  });

  it("reuses address-validator copy for failures", () => {
    expect(formatLineReason("bad_checksum_or_length")).toBe("The checksum or length is wrong");
  });
});

describe("formatDuplicateLines", () => {
  it("lists other line numbers", () => {
    expect(formatDuplicateLines([4])).toBe("Also on line 4");
    expect(formatDuplicateLines([1, 4])).toBe("Also on lines 1, 4");
  });
});
