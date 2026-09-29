import { describe, expect, it } from "vitest";
import { formatSeconds, formatTimestamp } from "@/features/predicate-builder/lib/format";

describe("formatTimestamp", () => {
  it("formats Unix seconds to ISO 8601", () => {
    const unixSeconds = 1798761600; // 2027-01-01 00:00:00 UTC
    const result = formatTimestamp(unixSeconds);
    
    expect(result).toBe("2027-01-01T00:00:00.000Z");
  });

  it("handles timestamps with millisecond precision", () => {
    const unixSeconds = 1609459200; // 2021-01-01 00:00:00 UTC
    const result = formatTimestamp(unixSeconds);
    
    expect(result).toBe("2021-01-01T00:00:00.000Z");
  });
});

describe("formatSeconds", () => {
  it("formats 1 second", () => {
    expect(formatSeconds(1)).toBe("1 second");
  });

  it("formats multiple seconds", () => {
    expect(formatSeconds(30)).toBe("30 seconds");
  });

  it("formats 1 minute", () => {
    expect(formatSeconds(60)).toBe("1 minute");
  });

  it("formats multiple minutes", () => {
    expect(formatSeconds(300)).toBe("5 minutes");
  });

  it("formats 1 hour", () => {
    expect(formatSeconds(3600)).toBe("1 hour");
  });

  it("formats multiple hours", () => {
    expect(formatSeconds(7200)).toBe("2 hours");
  });

  it("formats 1 day", () => {
    expect(formatSeconds(86400)).toBe("1 day");
  });

  it("formats multiple days", () => {
    expect(formatSeconds(172800)).toBe("2 days");
  });

  it("formats non-round seconds", () => {
    expect(formatSeconds(90)).toBe("90 seconds");
  });
});
