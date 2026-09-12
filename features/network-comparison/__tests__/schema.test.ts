import { describe, expect, it } from "vitest";
import { parseNetworkComparisonInput } from "@/features/network-comparison/schema";

describe("parseNetworkComparisonInput", () => {
  it("succeeds when called with no arguments", () => {
    const result = parseNetworkComparisonInput();
    expect(result.ok).toBe(true);
  });

  it("stamps the timestamp of the comparison request", () => {
    const before = Date.now();
    const result = parseNetworkComparisonInput();
    expect(result.ok && result.value.refreshedAt).toBeGreaterThanOrEqual(before);
  });

  it("rejects input starting with secret key prefix S", () => {
    const secretKey = "SCZANGBA5YHTNYVVV4C3U252E2B6P6F5T3U6L6C5M4N3B2V1C0X9Z8Y7";
    const result = parseNetworkComparisonInput(secretKey);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("request_failed");
    }
  });

  it("accepts safe non-secret string values", () => {
    const result = parseNetworkComparisonInput("refresh");
    expect(result.ok).toBe(true);
  });
});
