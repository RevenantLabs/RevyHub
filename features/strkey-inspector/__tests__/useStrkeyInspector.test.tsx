import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useStrkeyInspector } from "@/features/strkey-inspector/hooks/useStrkeyInspector";
import {
  secretSeed,
  truncatedPublicKey,
  validPublicKey
} from "@/features/strkey-inspector/fixtures/strkeyInspector.fixture";

describe("useStrkeyInspector", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useStrkeyInspector());
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("moves to a success state for a valid StrKey", async () => {
    const { result } = renderHook(() => useStrkeyInspector());

    await act(async () => {
      await result.current.submit(validPublicKey);
    });

    expect(result.current.state.status).toBe("success");
    expect(result.current.state).toMatchObject({
      status: "success",
      result: { kind: "ed25519_public_key", strkey: validPublicKey }
    });
  });

  it("surfaces the specific failure code for truncated key", async () => {
    const { result } = renderHook(() => useStrkeyInspector());

    await act(async () => {
      await result.current.submit(truncatedPublicKey);
    });

    expect(result.current.state).toEqual({
      status: "error",
      code: "bad_checksum"
    });
  });

  it("never carries a secret seed into state", async () => {
    const { result } = renderHook(() => useStrkeyInspector());

    await act(async () => {
      await result.current.submit(secretSeed);
    });

    expect(result.current.state).toEqual({
      status: "error",
      code: "secret_seed_rejected"
    });
    expect(JSON.stringify(result.current.state)).not.toContain(secretSeed);
  });

  it("returns to idle on reset", async () => {
    const { result } = renderHook(() => useStrkeyInspector());

    await act(async () => {
      await result.current.submit(validPublicKey);
    });
    act(() => result.current.reset());

    expect(result.current.state).toEqual({ status: "idle" });
  });
});
