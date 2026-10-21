import { describe, expect, it } from "vitest";
import { copy } from "@/features/signing-payload-inspector/copy";
import { formatByteLength, formatTag, formatVariant } from "@/features/signing-payload-inspector/lib/format";

describe("presentation formatting", () => {
  it("names all envelope variants", () => {
    expect(formatVariant("classic-v0")).toBe(copy.variantClassicV0);
    expect(formatVariant("classic-v1")).toBe(copy.variantClassicV1);
    expect(formatVariant("fee-bump")).toBe(copy.variantFeeBump);
  });
  it("names the exact protocol tags", () => {
    expect(formatTag("classic")).toBe(copy.tagClassic);
    expect(formatTag("fee-bump")).toBe(copy.tagFeeBump);
  });
  it("formats the signature base length", () => {
    expect(formatByteLength(1234)).toBe("1,234 bytes");
  });
});
