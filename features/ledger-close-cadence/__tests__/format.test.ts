import { describe, expect, it } from "vitest";
import {
  formatCount,
  formatDurationMs,
  formatLedgerLabel,
  formatNetworkLabel
} from "@/features/ledger-close-cadence/lib/format";

describe("formatDurationMs", () => {
  it("formats sub-second durations in milliseconds", () => {
    expect(formatDurationMs(250)).toBe("250 ms");
  });

  it("formats whole seconds without trailing decimals", () => {
    expect(formatDurationMs(5000)).toBe("5 s");
  });

  it("formats fractional seconds with three digits", () => {
    expect(formatDurationMs(5125)).toBe("5.125 s");
  });

  it("formats minutes and leftover seconds", () => {
    expect(formatDurationMs(125_000)).toBe("2 m 5 s");
  });
});

describe("formatNetworkLabel", () => {
  it("labels configured networks", () => {
    expect(formatNetworkLabel("testnet")).toBe("Testnet");
    expect(formatNetworkLabel("mainnet")).toBe("Mainnet");
  });
});

describe("formatLedgerLabel", () => {
  it("joins sequence and close time", () => {
    expect(formatLedgerLabel("1001", "2026-09-29T12:00:00.000Z")).toBe(
      "#1001 · 2026-09-29T12:00:00.000Z"
    );
  });
});

describe("formatCount", () => {
  it("stringifies counts", () => {
    expect(formatCount(4)).toBe("4");
  });
});
