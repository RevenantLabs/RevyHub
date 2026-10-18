import { describe, expect, it } from "vitest";
import {
  buildCallouts,
  buildSummary,
  describeFlag,
  formatFlagState,
  hasNoSpecialFlags
} from "@/features/asset-flags-inspector/lib/format";
import {
  immutableFlags,
  noFlags,
  restrictedFlags
} from "@/features/asset-flags-inspector/fixtures/assetFlagsInspector.fixture";

describe("formatFlagState", () => {
  it("labels enabled and disabled flags clearly", () => {
    expect(formatFlagState(true)).toBe("Enabled");
    expect(formatFlagState(false)).toBe("Disabled");
  });
});

describe("describeFlag", () => {
  it("explains clawback in holder terms when enabled", () => {
    expect(describeFlag("authClawbackEnabled", true)).toMatch(/claw back/i);
  });

  it("explains immutable authorization as permanent when enabled", () => {
    expect(describeFlag("authImmutable", true)).toMatch(/never be changed/i);
  });
});

describe("buildSummary", () => {
  it("describes an account with no flags as ordinary", () => {
    expect(buildSummary(noFlags)).toMatch(/no special authorization flags/i);
  });

  it("lists enabled flags by name", () => {
    expect(buildSummary(restrictedFlags)).toMatch(/Authorization required/);
    expect(buildSummary(restrictedFlags)).toMatch(/Authorization revocable/);
  });
});

describe("buildCallouts", () => {
  it("states that flags apply to issued assets", () => {
    expect(buildCallouts(noFlags)[0]).toMatch(/assets this account issues/i);
  });

  it("calls out full issuer control for required plus revocable", () => {
    expect(buildCallouts(restrictedFlags).join(" ")).toMatch(/full control/i);
  });

  it("warns that immutable authorization is permanent", () => {
    expect(buildCallouts(immutableFlags).join(" ")).toMatch(/cannot be changed later/i);
  });
});

describe("hasNoSpecialFlags", () => {
  it("returns true only when every flag is off", () => {
    expect(hasNoSpecialFlags(noFlags)).toBe(true);
    expect(hasNoSpecialFlags(restrictedFlags)).toBe(false);
  });
});
