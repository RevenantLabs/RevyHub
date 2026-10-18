import { describe, expect, it } from "vitest";
import {
  boundStatusTone,
  formatDuration,
  formatIsoTimestamp,
  formatLedgerBound,
  formatLedgerBoundAt,
  formatLedgerDistance,
  formatRelativeSeconds,
  formatTimeBound,
  formatUnixSeconds,
  verdictTone
} from "@/features/preconditions-explainer/lib/format";

describe("formatUnixSeconds", () => {
  it("renders zero as unbounded rather than as 1970", () => {
    expect(formatUnixSeconds("0")).toBe("Unbounded");
  });

  it("renders a Unix second as a readable UTC timestamp", () => {
    expect(formatUnixSeconds("1700000000")).toBe("2023-11-14 22:13:20 UTC");
  });

  it("refuses a uint64 bound no Date can represent instead of showing Invalid Date", () => {
    expect(formatUnixSeconds("18446744073709551615")).toBe("Beyond any representable date");
  });
});

describe("formatDuration", () => {
  it("uses the two largest non-zero units", () => {
    expect(formatDuration("183900")).toBe("2 days 3 hours");
    expect(formatDuration("3660")).toBe("1 hour 1 minute");
    expect(formatDuration("90")).toBe("1 minute 30 seconds");
  });

  it("singularises a single unit", () => {
    expect(formatDuration("86400")).toBe("1 day");
    expect(formatDuration("1")).toBe("1 second");
  });

  it("drops the sign so the caller decides the direction", () => {
    expect(formatDuration("-3600")).toBe("1 hour");
  });

  it("handles zero and values far beyond Number.MAX_SAFE_INTEGER", () => {
    expect(formatDuration("0")).toBe("0 seconds");
    expect(formatDuration("18446744073709551615")).toBe("213503982334601 days 7 hours");
  });
});

describe("formatRelativeSeconds", () => {
  it("reads forwards for a future offset and backwards for a past one", () => {
    expect(formatRelativeSeconds("7200")).toBe("in 2 hours");
    expect(formatRelativeSeconds("-3600")).toBe("1 hour ago");
  });

  it("says right now at the boundary", () => {
    expect(formatRelativeSeconds("0")).toBe("right now");
  });
});

describe("formatTimeBound", () => {
  it("shows the absolute date next to its distance from now", () => {
    expect(formatTimeBound("1700000000", "-3600")).toBe(
      "2023-11-14 22:13:20 UTC (1 hour ago)"
    );
  });

  it("omits the distance for an unset bound", () => {
    expect(formatTimeBound("0", null)).toBe("Unbounded");
  });
});

describe("formatLedgerBound", () => {
  it("renders zero as unbounded and groups large sequences", () => {
    expect(formatLedgerBound(0)).toBe("Unbounded");
    expect(formatLedgerBound(1_400_000)).toBe("#1,400,000");
  });
});

describe("formatLedgerDistance", () => {
  it("names the direction and pluralises correctly", () => {
    expect(formatLedgerDistance(5_000)).toBe("5000 ledgers away");
    expect(formatLedgerDistance(-1)).toBe("1 ledger ago");
    expect(formatLedgerDistance(0)).toBe("This ledger");
  });

  it("says unbounded when there is nothing to measure against", () => {
    expect(formatLedgerDistance(null)).toBe("Unbounded");
  });
});

describe("formatLedgerBoundAt", () => {
  it("appends the distance when one is known", () => {
    expect(formatLedgerBoundAt(1_405_000, 5_000)).toBe("#1,405,000 (5000 ledgers away)");
  });

  it("leaves an unset or uncompared bound alone", () => {
    expect(formatLedgerBoundAt(0, null)).toBe("Unbounded");
    expect(formatLedgerBoundAt(1_405_000, null)).toBe("#1,405,000");
  });
});

describe("tones", () => {
  it("keeps a satisfied bound calm and an expired transaction loud", () => {
    expect(boundStatusTone("satisfied")).toBe("success");
    expect(boundStatusTone("unknown")).toBe("info");
    expect(boundStatusTone("expired")).toBe("warning");
    expect(verdictTone("satisfiable")).toBe("success");
    expect(verdictTone("expired")).toBe("error");
    expect(verdictTone("not_yet")).toBe("warning");
    expect(verdictTone("unknown")).toBe("warning");
  });
});

describe("formatIsoTimestamp", () => {
  it("renders an ISO timestamp the same way as a decoded bound", () => {
    expect(formatIsoTimestamp("2023-11-14T22:13:20.000Z")).toBe("2023-11-14 22:13:20 UTC");
  });

  it("passes an unparseable value through untouched", () => {
    expect(formatIsoTimestamp("not a date")).toBe("not a date");
  });
});
