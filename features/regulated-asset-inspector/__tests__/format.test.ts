import { describe, expect, it } from "vitest";
import { formatOptional, formatRegulatedStatus, SELF_PUBLISHED_NOTICE } from "@/features/regulated-asset-inspector/lib/format";
import type { RegulatedAssetInspectorResult } from "@/features/regulated-asset-inspector/types";

const base = {
  issuerId: "G",
  assetCode: "USDC",
  homeDomain: "issuer.example",
  tomlUrl: "https://issuer.example/.well-known/stellar.toml",
  network: "testnet",
  regulatedStatus: "not_regulated",
  approvalServer: null,
  approvalCriteria: "KYC",
  regulatedFieldPresent: true,
  issuerFlags: {
    authRequired: true,
    authRevocable: false,
    authImmutable: false,
    authClawbackEnabled: false
  },
  selfPublishedNotice: SELF_PUBLISHED_NOTICE
} satisfies RegulatedAssetInspectorResult;

describe("format", () => {
  it("labels regulated and not regulated exactly", () => {
    expect(formatRegulatedStatus({ ...base, regulatedStatus: "regulated" })).toBe("Regulated");
    expect(formatRegulatedStatus({ ...base, regulatedStatus: "not_regulated" })).toBe("Not regulated");
  });

  it("renders a missing optional field as Not declared", () => {
    expect(formatOptional(null)).toBe("Not declared");
    expect(formatOptional("https://issuer.example/approve")).toBe("https://issuer.example/approve");
  });
});
