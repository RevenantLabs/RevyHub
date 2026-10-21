import { describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import { act, renderHook } from "@testing-library/react";
import { NetworkProvider, useNetwork } from "@/core/network/NetworkProvider";
import { useAssetIdentityValidator } from "@/features/asset-identity-validator/hooks/useAssetIdentityValidator";
import {
  issuer,
  secretSeed,
  truncatedIssuer,
  validCode
} from "@/features/asset-identity-validator/fixtures/assetIdentityValidator.fixture";
import { alphanum12Codes } from "@/features/asset-identity-validator/fixtures/alphanum12-codes.fixture";

function wrapper({ children }: { children: ReactNode }) {
  return <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;
}

describe("useAssetIdentityValidator", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useAssetIdentityValidator(), { wrapper });
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("moves through loading into a success result", async () => {
    const { result } = renderHook(() => useAssetIdentityValidator(), { wrapper });
    let pending: Promise<void> | undefined;

    act(() => {
      pending = result.current.submit({ code: validCode, issuer });
    });

    expect(result.current.state.status).toBe("loading");

    await act(async () => {
      await pending;
    });

    expect(result.current.state).toMatchObject({
      status: "success",
      result: { tier: "alphanum4", canonical: `${validCode}:${issuer}` }
    });
  });

  it("moves through loading into a specific failure", async () => {
    const { result } = renderHook(() => useAssetIdentityValidator(), { wrapper });
    let pending: Promise<void> | undefined;

    act(() => {
      pending = result.current.submit({ code: alphanum12Codes.tooLong, issuer });
    });

    expect(result.current.state.status).toBe("loading");

    await act(async () => {
      await pending;
    });

    expect(result.current.state).toEqual({ status: "error", code: "invalid_code_length" });
  });

  it("rejects an empty code without storing a later success", async () => {
    const { result } = renderHook(() => useAssetIdentityValidator(), { wrapper });

    await act(async () => {
      await result.current.submit({ code: validCode, issuer });
    });
    await act(async () => {
      await result.current.submit({ code: " ", issuer });
    });

    expect(result.current.state).toEqual({ status: "error", code: "empty_code" });
  });

  it("never carries a secret seed into state", async () => {
    const { result } = renderHook(() => useAssetIdentityValidator(), { wrapper });

    await act(async () => {
      await result.current.submit({ code: validCode, issuer: secretSeed });
    });

    expect(result.current.state).toEqual({ status: "error", code: "invalid_issuer" });
    expect(JSON.stringify(result.current.state)).not.toContain(secretSeed);
  });

  it("keeps the local result when the selected network changes", async () => {
    const { result } = renderHook(
      () => ({ tool: useAssetIdentityValidator(), network: useNetwork() }),
      { wrapper }
    );

    await act(async () => {
      await result.current.tool.submit({ code: validCode, issuer });
    });

    const snapshot = result.current.tool.state;
    expect(snapshot.status).toBe("success");

    act(() => result.current.network.setNetwork("mainnet"));

    expect(result.current.network.network).toBe("mainnet");
    expect(result.current.tool.state).toEqual(snapshot);
    expect(JSON.stringify(result.current.tool.state)).not.toContain("horizon");
  });

  it("returns to idle on reset", async () => {
    const { result } = renderHook(() => useAssetIdentityValidator(), { wrapper });

    await act(async () => {
      await result.current.submit({ code: validCode, issuer: truncatedIssuer });
    });
    act(() => result.current.reset());

    expect(result.current.state).toEqual({ status: "idle" });
  });
});
