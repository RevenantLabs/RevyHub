import { describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { withMswHandlers } from "@/core/testing/msw";
import { useAssetMetadata } from "@/features/asset-metadata/hooks/useAssetMetadata";
import { handlers, notFoundHandler, tomlHandler } from "@/features/asset-metadata/msw/handlers";
import {
  DOMAIN,
  tomlWithoutCurrencies
} from "@/features/asset-metadata/fixtures/assetMetadata.fixture";

const server = withMswHandlers(...handlers);

describe("useAssetMetadata", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useAssetMetadata());
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("reads a domain's declared assets", async () => {
    const { result } = renderHook(() => useAssetMetadata());

    await act(async () => {
      await result.current.submit(DOMAIN);
    });

    await waitFor(() => expect(result.current.state.status).toBe("success"));
    if (result.current.state.status !== "success") return;
    expect(result.current.state.result.currencies).toHaveLength(2);
  });

  it("rejects an insecure scheme before making a request", async () => {
    const { result } = renderHook(() => useAssetMetadata());

    await act(async () => {
      await result.current.submit(`http://${DOMAIN}`);
    });

    expect(result.current.state).toEqual({ status: "error", code: "insecure_scheme" });
  });

  it("reports a domain with no toml", async () => {
    server.use(notFoundHandler);
    const { result } = renderHook(() => useAssetMetadata());

    await act(async () => {
      await result.current.submit(DOMAIN);
    });

    await waitFor(() =>
      expect(result.current.state).toEqual({ status: "error", code: "toml_not_found" })
    );
  });

  it("treats a toml with no currencies as a success", async () => {
    server.use(tomlHandler(tomlWithoutCurrencies));
    const { result } = renderHook(() => useAssetMetadata());

    await act(async () => {
      await result.current.submit(DOMAIN);
    });

    await waitFor(() => expect(result.current.state.status).toBe("success"));
    if (result.current.state.status !== "success") return;
    expect(result.current.state.result.currencies).toEqual([]);
  });

  it("clears the result on reset", async () => {
    const { result } = renderHook(() => useAssetMetadata());

    await act(async () => {
      await result.current.submit(DOMAIN);
    });
    await waitFor(() => expect(result.current.state.status).toBe("success"));

    act(() => result.current.reset());
    expect(result.current.state).toEqual({ status: "idle" });
  });
});
