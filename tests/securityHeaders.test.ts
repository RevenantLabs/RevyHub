import { describe, expect, it } from "vitest";
import { buildContentSecurityPolicy, buildSecurityHeaders } from "../lib/security-headers.mjs";

describe("security headers", () => {
  it("sets the expected production browser security headers", () => {
    const headers = buildSecurityHeaders(false);
    const headerMap = new Map(headers.map(({ key, value }) => [key, value]));

    expect(headerMap.get("X-Frame-Options")).toBe("DENY");
    expect(headerMap.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headerMap.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(headerMap.get("Strict-Transport-Security")).toBe("max-age=63072000; includeSubDomains; preload");
    expect(headerMap.get("Permissions-Policy")).toContain("camera=()");
    expect(headerMap.get("Cross-Origin-Opener-Policy")).toBe("same-origin");
  });

  it("builds a narrow production CSP for Stellar dependencies", () => {
    const csp = buildContentSecurityPolicy(false);

    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self'");
    expect(csp).not.toContain("'unsafe-eval'");
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    expect(csp).toContain("img-src 'self' data: blob:");
    expect(csp).toContain("connect-src 'self' https://horizon-testnet.stellar.org https://horizon.stellar.org https://friendbot.stellar.org");
    expect(csp).toContain("frame-src 'none'");
    expect(csp).toContain("form-action 'self'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("upgrade-insecure-requests");
  });

  it("keeps development usable without relaxing production", () => {
    const csp = buildContentSecurityPolicy(true);

    expect(csp).toContain("script-src 'self' 'unsafe-eval'");
    expect(csp).toContain("http://localhost:*");
    expect(csp).not.toContain("upgrade-insecure-requests");
  });
});
