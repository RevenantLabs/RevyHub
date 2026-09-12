import { describe, expect, it } from "vitest";
import {
  parseHorizonHealthInput,
  parseHorizonHealthRequest
} from "@/features/horizon-health/schema";

describe("parseHorizonHealthRequest", () => {
  it("always succeeds because no user input is required", () => {
    const result = parseHorizonHealthRequest();
    expect(result.ok).toBe(true);
  });

  it("stamps the timestamp of the request", () => {
    const before = Date.now();
    const result = parseHorizonHealthRequest();
    expect(result.ok && result.value.refreshedAt).toBeGreaterThanOrEqual(before);
  });
});

describe("parseHorizonHealthInput", () => {
  it("succeeds when optional input is not provided", () => {
    const result = parseHorizonHealthInput();
    expect(result.ok).toBe(true);
  });

  it("rejects secret keys if accidentally supplied", () => {
    const result = parseHorizonHealthInput("SBZTESTSECRETKEYEXAMPLEXYZ");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("unexpected_response");
    }
  });
});
