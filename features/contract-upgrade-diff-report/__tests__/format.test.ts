import { describe, expect, it } from "vitest";
import {
  changedFirst,
  evidenceTone,
  fill,
  formatByteSize,
  formatCodeHash,
  formatEnvVersion,
  formatSide,
  statusTone
} from "@/features/contract-upgrade-diff-report/lib/format";
import type { DeclarationChange } from "@/features/contract-upgrade-diff-report/types";

describe("formatByteSize", () => {
  it("shows the exact count with grouping, never rounded", () => {
    expect(formatByteSize(1_048_576)).toBe("1,048,576 bytes");
    expect(formatByteSize(1_048_577)).toBe("1,048,577 bytes");
    expect(formatByteSize(1)).toBe("1 byte");
    expect(formatByteSize(0)).toBe("0 bytes");
  });
});

describe("formatCodeHash", () => {
  it("keeps all 64 characters", () => {
    const hash = "AB".repeat(32);
    expect(formatCodeHash(hash)).toBe("ab".repeat(32));
    expect(formatCodeHash(hash)).toHaveLength(64);
  });
});

describe("formatEnvVersion", () => {
  it("shows the protocol and any pre-release number", () => {
    expect(formatEnvVersion({ protocol: 22, preRelease: 0 })).toBe("Protocol 22");
    expect(formatEnvVersion({ protocol: 22, preRelease: 3 })).toBe("Protocol 22, pre-release 3");
    expect(formatEnvVersion({ protocol: 4_294_967_295, preRelease: 0 })).toBe("Protocol 4294967295");
    expect(formatEnvVersion(null)).toBe("Unknown");
  });
});

describe("formatSide", () => {
  it("distinguishes an absent value from an empty one", () => {
    expect(formatSide(null)).toBe("—");
    expect(formatSide("")).toBe("(empty)");
    expect(formatSide("Result<(), Error>")).toBe("Result<(), Error>");
  });
});

describe("fill", () => {
  it("replaces known placeholders and leaves unknown ones", () => {
    expect(fill("{name} x {count} {other}", { name: "Error", count: 2 })).toBe("Error x 2 {other}");
  });
});

describe("tones", () => {
  it("maps statuses and evidence to tones", () => {
    expect(statusTone("removed")).toBe("danger");
    expect(statusTone("unknown")).toBe("info");
    expect(evidenceTone("present")).toBe("success");
    expect(evidenceTone("absent")).toBe("info");
    expect(evidenceTone("conflicting")).toBe("warning");
    expect(evidenceTone("malformed_data")).toBe("danger");
  });
});

describe("changedFirst", () => {
  it("puts removed and changed first and keeps the original order within a status", () => {
    const change = (name: string, status: DeclarationChange["status"]) =>
      ({ kind: "function", name, status }) as DeclarationChange;
    expect(
      changedFirst([change("a", "unchanged"), change("b", "added"), change("c", "removed"), change("d", "added")]).map(
        (c) => c.name
      )
    ).toEqual(["c", "b", "d", "a"]);
  });
});
