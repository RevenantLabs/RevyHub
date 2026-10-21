import { describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { NetworkProvider, useNetwork } from "@/core/network/NetworkProvider";
import { useStrkeyCorruptionLocator } from "@/features/strkey-corruption-locator/hooks/useStrkeyCorruptionLocator";
import {
  originalPublicKey,
  seedShapedNearMiss,
  singleCharTypo
} from "@/features/strkey-corruption-locator/fixtures/single-char-typo.fixture";
import { unfixableString } from "@/features/strkey-corruption-locator/fixtures/unfixable-string.fixture";
import { secretSeed, validPublicKey } from "@/features/strkey-corruption-locator/fixtures/strkeyCorruptionLocator.fixture";

function wrapper({ children }: { children: ReactNode }) {
  return <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;
}

describe("useStrkeyCorruptionLocator", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useStrkeyCorruptionLocator(), { wrapper });
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("reports empty input without leaving the error code", async () => {
    const { result } = renderHook(() => useStrkeyCorruptionLocator(), { wrapper });

    await act(async () => {
      await result.current.submit("   ");
    });

    expect(result.current.state).toEqual({ status: "error", code: "empty_input" });
  });

  it("enters loading before a local scan resolves", async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useStrkeyCorruptionLocator(), { wrapper });

    act(() => {
      void result.current.submit(singleCharTypo);
    });
    expect(result.current.state.status).toBe("loading");

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.state.status).toBe("success");
    vi.useRealTimers();
  });

  it("recovers the original public key", async () => {
    const { result } = renderHook(() => useStrkeyCorruptionLocator(), { wrapper });

    await act(async () => {
      await result.current.submit(singleCharTypo);
    });

    await waitFor(() => expect(result.current.state.status).toBe("success"));
    if (result.current.state.status !== "success") return;
    expect(result.current.state.result.candidates.some((candidate) => candidate.corrected === originalPublicKey)).toBe(
      true
    );
  });

  it("rejects a valid key with no correction in state", async () => {
    const { result } = renderHook(() => useStrkeyCorruptionLocator(), { wrapper });

    await act(async () => {
      await result.current.submit(validPublicKey);
    });

    expect(result.current.state).toEqual({ status: "error", code: "already_valid" });
    expect(JSON.stringify(result.current.state)).not.toContain(validPublicKey);
  });

  it("does not search or store a secret seed", async () => {
    const { result } = renderHook(() => useStrkeyCorruptionLocator(), { wrapper });

    await act(async () => {
      await result.current.submit(secretSeed);
    });

    expect(result.current.state).toEqual({ status: "error", code: "contains_secret_seed" });
    expect(JSON.stringify(result.current.state)).not.toContain(secretSeed);
  });

  it("does not search a seed-shaped near miss", async () => {
    const { result } = renderHook(() => useStrkeyCorruptionLocator(), { wrapper });

    await act(async () => {
      await result.current.submit(seedShapedNearMiss);
    });

    expect(result.current.state).toEqual({ status: "error", code: "contains_secret_seed" });
    expect(JSON.stringify(result.current.state)).not.toContain(originalPublicKey);
  });

  it("records an unfixable string as no candidates", async () => {
    const { result } = renderHook(() => useStrkeyCorruptionLocator(), { wrapper });

    await act(async () => {
      await result.current.submit(unfixableString);
    });

    await waitFor(() => expect(result.current.state.status).toBe("no_candidates"));
    expect(result.current.state).toEqual({ status: "no_candidates", length: unfixableString.length });
  });

  it("returns to idle on reset", async () => {
    const { result } = renderHook(() => useStrkeyCorruptionLocator(), { wrapper });

    await act(async () => {
      await result.current.submit(singleCharTypo);
    });
    await waitFor(() => expect(result.current.state.status).toBe("success"));
    act(() => result.current.reset());

    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("keeps a local result when the selected network changes", async () => {
    const { result } = renderHook(
      () => {
        const locator = useStrkeyCorruptionLocator();
        const { setNetwork } = useNetwork();
        return { ...locator, setNetwork };
      },
      { wrapper }
    );

    await act(async () => {
      await result.current.submit(singleCharTypo);
    });
    await waitFor(() => expect(result.current.state.status).toBe("success"));

    act(() => result.current.setNetwork("mainnet"));

    expect(result.current.network).toBe("mainnet");
    expect(result.current.state.status).toBe("success");
  });
});
