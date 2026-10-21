import { describe, expect, it } from "vitest";
import { normalizeApproval } from "@/features/regulated-asset-inspector/lib/approval-criteria";

describe("normalizeApproval", () => {
  it("trims server and criteria text", () => {
    expect(
      normalizeApproval({
        approvalServer: " https://issuer.example/approve ",
        approvalCriteria: "  KYC required  "
      })
    ).toEqual({
      approvalServer: "https://issuer.example/approve",
      approvalCriteria: "KYC required"
    });
  });

  it("turns blank publisher text into not-declared nulls", () => {
    expect(normalizeApproval({ approvalServer: "   ", approvalCriteria: "" })).toEqual({
      approvalServer: null,
      approvalCriteria: null
    });
  });
});
