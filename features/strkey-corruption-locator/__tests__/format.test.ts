import { describe, expect, it } from "vitest";
import {
  formatCandidateBound,
  formatCandidateCount,
  formatKind,
  formatLength,
  formatSubstitution
} from "@/features/strkey-corruption-locator/lib/format";
import { copy } from "@/features/strkey-corruption-locator/copy";
import { sampleCandidateReport } from "@/features/strkey-corruption-locator/fixtures/strkeyCorruptionLocator.fixture";

describe("format helpers", () => {
  it("names every public StrKey kind", () => {
    expect(formatKind("ed25519PublicKey")).toBe("Ed25519 public key");
    expect(formatKind("med25519PublicKey")).toBe("Muxed account");
    expect(formatKind("contract")).toBe("Contract");
    expect(formatKind("signedPayload")).toBe("Signed payload");
  });

  it("pluralises length", () => {
    expect(formatLength(1)).toBe("1 character");
    expect(formatLength(56)).toBe("56 characters");
  });

  it("formats a substitution with a one-based position", () => {
    const candidate = sampleCandidateReport.candidates[0];
    expect(candidate).toBeDefined();
    if (!candidate) return;

    expect(formatSubstitution(candidate)).toBe(
      copy.substitution.replace("{position}", "5").replace("{from}", "A").replace("{to}", "C")
    );
  });

  it("formats the visible bound and the exact count", () => {
    expect(formatCandidateCount(1)).toBe("1 single-character correction found");
    expect(formatCandidateCount(3)).toBe("3 single-character corrections found");
    expect(formatCandidateBound(8, 11)).toBe("Showing 8 of 11. Earlier positions are listed first.");
  });
});
