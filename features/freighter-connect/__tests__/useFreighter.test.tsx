import { afterEach, describe, expect, it } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useFreighter } from "@/features/freighter-connect/hooks/useFreighter";
import {
  connectedApi,
  lockedApi,
  walletPublicKey
} from "@/features/freighter-connect/fixtures/freighterConnect.fixture";
import type { FreighterApi } from "@/features/freighter-connect/types";

function install(api: FreighterApi | undefined) {
  if (api) {
    (window as unknown as { freighterApi?: FreighterApi }).freighterApi = api;
  } else {
    delete (window as unknown as { freighterApi?: FreighterApi }).freighterApi;
  }
}

afterEach(() => install(undefined));

describe("useFreighter", () => {
  it("reports a missing extension after the first check", async () => {
    install(undefined);
    const { result } = renderHook(() => useFreighter());

    await waitFor(() =>
      expect(result.current.state).toEqual({ status: "error", code: "not_installed" })
    );
  });

  it("reads a connected wallet on mount", async () => {
    install(connectedApi);
    const { result } = renderHook(() => useFreighter());

    await waitFor(() => expect(result.current.state.status).toBe("ready"));
    expect(result.current.state).toMatchObject({
      snapshot: { publicKey: walletPublicKey, network: "testnet" }
    });
  });

  it("picks up an extension installed after the first check", async () => {
    install(undefined);
    const { result } = renderHook(() => useFreighter());
    await waitFor(() => expect(result.current.state.status).toBe("error"));

    install(connectedApi);
    await act(async () => {
      await result.current.refresh();
    });

    await waitFor(() => expect(result.current.state.status).toBe("ready"));
  });

  it("moves from not-allowed to connected after requesting access", async () => {
    install(lockedApi);
    const { result } = renderHook(() => useFreighter());
    await waitFor(() => expect(result.current.state.status).toBe("ready"));
    expect(result.current.state).toMatchObject({ snapshot: { allowed: false } });

    install(connectedApi);
    await act(async () => {
      await result.current.connect();
    });

    await waitFor(() =>
      expect(result.current.state).toMatchObject({ snapshot: { allowed: true } })
    );
  });
});
