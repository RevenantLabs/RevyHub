import { describe, expect, it } from "vitest";
import {
  formatCandidateCount,
  formatEnvelopeVariant,
  formatHint,
  formatIndex,
  formatMatchKind,
  formatSignatureCount,
  formatSignatureGroup
} from "@/features/signature-hint-auditor/lib/format";
import {
  isUnsupportedEnvelope,
  toSignatureHintAuditorErrorCode
} from "@/features/signature-hint-auditor/lib/signatureHintAuditor.errors";
import { copy } from "@/features/signature-hint-auditor/copy";

describe("formatHint", () => {
  it("prefixes lowercase hex with 0x", () => {
    expect(formatHint("aabbccdd")).toBe("0xaabbccdd");
  });
});

describe("formatEnvelopeVariant", () => {
  it("names every supported variant", () => {
    expect(formatEnvelopeVariant("classic-v0")).toBe(copy.variantClassicV0);
    expect(formatEnvelopeVariant("classic-v1")).toBe(copy.variantClassicV1);
    expect(formatEnvelopeVariant("fee-bump")).toBe(copy.variantFeeBump);
  });
});

describe("formatSignatureGroup", () => {
  it("labels classic and fee-bump groups distinctly", () => {
    expect(formatSignatureGroup("transaction")).toBe(copy.groupTransaction);
    expect(formatSignatureGroup("fee_bump_outer")).toBe(copy.groupOuter);
    expect(formatSignatureGroup("fee_bump_inner")).toBe(copy.groupInner);
  });
});

describe("formatMatchKind", () => {
  it("never calls a match a verified signature", () => {
    expect(formatMatchKind("single")).toBe(copy.matchSingle);
    expect(formatMatchKind("single")).not.toMatch(/verif/i);
    expect(formatMatchKind("collision")).toBe(copy.matchCollision);
    expect(formatMatchKind("none")).toBe(copy.matchNone);
  });
});

describe("formatSignatureCount", () => {
  it("uses singular and plural forms", () => {
    expect(formatSignatureCount(1)).toBe("1 signature");
    expect(formatSignatureCount(0)).toBe("0 signatures");
    expect(formatSignatureCount(2)).toBe("2 signatures");
  });
});

describe("formatCandidateCount", () => {
  it("explains zero, one and many candidates", () => {
    expect(formatCandidateCount(0)).toBe(copy.noCandidates);
    expect(formatCandidateCount(1)).toBe(copy.oneCandidate);
    expect(formatCandidateCount(2)).toBe(copy.collisionLabel);
  });
});

describe("formatIndex", () => {
  it("renders a readable index marker", () => {
    expect(formatIndex(0)).toBe("#0");
    expect(formatIndex(3)).toBe("#3");
  });
});

describe("error classification", () => {
  it("maps unexpected throws to invalid_xdr", () => {
    expect(toSignatureHintAuditorErrorCode(new Error("boom"))).toBe("invalid_xdr");
  });

  it("flags unsupported envelopes for an informational notice", () => {
    expect(isUnsupportedEnvelope("unsupported_envelope")).toBe(true);
    expect(isUnsupportedEnvelope("invalid_xdr")).toBe(false);
  });
});
