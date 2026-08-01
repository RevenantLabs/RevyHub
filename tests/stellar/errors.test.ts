import { describe, expect, it } from "vitest";
import { isTransientError } from "../../lib/stellar/errors";

function horizonError(status: number): unknown {
  return { response: { status } };
}

describe("isTransientError", () => {
  it("classifies rate-limit (429) as transient", () => {
    expect(isTransientError(horizonError(429))).toBe(true);
  });

  it("classifies timeout (408) as transient", () => {
    expect(isTransientError(horizonError(408))).toBe(true);
  });

  it("classifies server error (500) as transient", () => {
    expect(isTransientError(horizonError(500))).toBe(true);
  });

  it("classifies bad-gateway (502) as transient", () => {
    expect(isTransientError(horizonError(502))).toBe(true);
  });

  it("classifies service-unavailable (503) as transient", () => {
    expect(isTransientError(horizonError(503))).toBe(true);
  });

  it("classifies gateway-timeout (504) as transient", () => {
    expect(isTransientError(horizonError(504))).toBe(true);
  });

  it("does not classify 404 as transient", () => {
    expect(isTransientError(horizonError(404))).toBe(false);
  });

  it("does not classify 400 as transient", () => {
    expect(isTransientError(horizonError(400))).toBe(false);
  });

  it("classifies TypeError (network failure) as transient", () => {
    expect(isTransientError(new TypeError("Failed to fetch"))).toBe(true);
  });

  it("classifies DOMException (abort) as transient", () => {
    expect(isTransientError(new DOMException("Aborted", "AbortError"))).toBe(true);
  });

  it("classifies Error with 'timeout' in message as transient", () => {
    expect(isTransientError(new Error("Request timeout after 10s"))).toBe(true);
  });

  it("classifies Error with 'network' in message as transient", () => {
    expect(isTransientError(new Error("Network error occurred"))).toBe(true);
  });

  it("does not classify a generic validation Error as transient", () => {
    expect(isTransientError(new Error("Enter a Stellar public address."))).toBe(false);
  });

  it("does not classify null as transient", () => {
    expect(isTransientError(null)).toBe(false);
  });

  it("does not classify a plain string as transient", () => {
    expect(isTransientError("something went wrong")).toBe(false);
  });
});
