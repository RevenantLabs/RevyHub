import { describe, expect, it } from "vitest";
import { withMswHandlers } from "@/core/testing/msw";
import {
  generateTestnetKeypair
} from "@/features/testnet-keypair-generator/lib/testnetKeypairGenerator";
import {
  handlers,
  fundedAccountHandler,
  rateLimitedHandler,
  serverErrorHandler
} from "@/features/testnet-keypair-generator/msw/handlers";
import { deterministicSeedBuffer } from "@/features/testnet-keypair-generator/fixtures/testnetKeypairGenerator.fixture";

const server = withMswHandlers(...handlers);

describe("generateTestnetKeypair", () => {
  it("generates a valid Stellar keypair", async () => {
    const result = await generateTestnetKeypair({ checkNetwork: false });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.publicKey).toMatch(/^G[A-Z2-7]{55}$/);
    expect(result.value.secretSeed).toMatch(/^S[A-Z2-7]{55}$/);
    expect(result.value.network).toBe("testnet");
    expect(result.value.networkCheckStatus).toBe("skipped");
    expect(result.value.friendbotUrl).toContain(result.value.publicKey);
  });

  it("supports deterministic seeds for reproducible test scenarios", async () => {
    const res1 = await generateTestnetKeypair(
      { checkNetwork: false },
      undefined,
      { deterministicSeed: deterministicSeedBuffer }
    );
    const res2 = await generateTestnetKeypair(
      { checkNetwork: false },
      undefined,
      { deterministicSeed: deterministicSeedBuffer }
    );

    expect(res1.ok).toBe(true);
    expect(res2.ok).toBe(true);
    if (!res1.ok || !res2.ok) return;

    expect(res1.value.publicKey).toBe(res2.value.publicKey);
    expect(res1.value.secretSeed).toBe(res2.value.secretSeed);
  });

  it("marks status as unfunded when Horizon returns 404", async () => {
    const result = await generateTestnetKeypair({ checkNetwork: true });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.networkCheckStatus).toBe("unfunded");
  });

  it("marks status as funded when Horizon returns 200", async () => {
    server.use(fundedAccountHandler);
    const result = await generateTestnetKeypair({ checkNetwork: true });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.networkCheckStatus).toBe("funded");
  });

  it("returns rate_limited error when Horizon returns 429", async () => {
    server.use(rateLimitedHandler);
    const result = await generateTestnetKeypair({ checkNetwork: true });

    expect(result).toEqual({ ok: false, code: "rate_limited" });
  });

  it("returns horizon_unavailable error when Horizon returns 500", async () => {
    server.use(serverErrorHandler);
    const result = await generateTestnetKeypair({ checkNetwork: true });

    expect(result).toEqual({ ok: false, code: "horizon_unavailable" });
  });

  it("attaches label when provided", async () => {
    const result = await generateTestnetKeypair({
      label: "Dev Staging Key",
      checkNetwork: false
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.label).toBe("Dev Staging Key");
  });

  it("never includes secret key in friendbot URL or external requests", async () => {
    const result = await generateTestnetKeypair({ checkNetwork: false });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.friendbotUrl).not.toContain(result.value.secretSeed);
    expect(result.value.friendbotUrl).toContain(result.value.publicKey);
  });
});
