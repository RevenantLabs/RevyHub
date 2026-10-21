import { describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { NetworkProvider, useNetwork } from "@/core/network/NetworkProvider";
import { delay, http, HttpResponse, withMswHandlers } from "@/core/testing/msw";
import { useSep38QuoteViewer } from "@/features/sep38-quote-viewer/hooks/useSep38QuoteViewer";
import {
  INDICATIVE_PRICE,
  TOML_URL,
  normalRaw,
  secretSeed,
  tomlDocument
} from "@/features/sep38-quote-viewer/fixtures/sep38QuoteViewer.fixture";
import { unsupportedPairRaw } from "@/features/sep38-quote-viewer/fixtures/unsupported-pair.fixture";
import { handlers } from "@/features/sep38-quote-viewer/msw/handlers";

const server = withMswHandlers(...handlers);

function wrapper({ children }: { children: React.ReactNode }) {
  return <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;
}

describe("useSep38QuoteViewer", () => {
  it("starts idle, loads a price, and resets", async () => {
    const { result } = renderHook(() => useSep38QuoteViewer(), { wrapper });
    expect(result.current.state).toEqual({ status: "idle" });

    await act(async () => {
      await result.current.submit(normalRaw);
    });
    await waitFor(() => expect(result.current.state.status).toBe("success"));
    expect(result.current.state).toMatchObject({
      status: "success",
      result: { quote: { price: INDICATIVE_PRICE }, indicativeOnly: true }
    });

    act(() => result.current.reset());
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("shows loading, then an unsupported pair", async () => {
    server.use(
      http.get(TOML_URL, async () => {
        await delay(40);
        return HttpResponse.text(tomlDocument);
      })
    );
    const { result } = renderHook(() => useSep38QuoteViewer(), { wrapper });
    let pending: Promise<void> = Promise.resolve();
    act(() => {
      pending = result.current.submit(unsupportedPairRaw);
    });
    expect(result.current.state.status).toBe("loading");
    await act(async () => {
      await pending;
    });
    expect(result.current.state).toEqual({ status: "error", code: "unsupported_pair" });
  });

  it("rejects a secret and an empty domain without leaving the seed in state", async () => {
    const { result } = renderHook(() => useSep38QuoteViewer(), { wrapper });
    await act(async () => {
      await result.current.submit({ ...normalRaw, homeDomain: "" });
    });
    expect(result.current.state).toEqual({
      status: "error",
      code: "invalid_home_domain",
      field: "home_domain"
    });

    await act(async () => {
      await result.current.submit({ ...normalRaw, onChainAsset: secretSeed });
    });
    expect(result.current.state).toMatchObject({ status: "error", code: "invalid_asset", field: "on_chain" });
    expect(JSON.stringify(result.current.state)).not.toContain(secretSeed);
  });

  it("hides a quote after the selected network changes", async () => {
    const { result } = renderHook(
      () => ({ tool: useSep38QuoteViewer(), network: useNetwork() }),
      { wrapper }
    );
    await act(async () => {
      await result.current.tool.submit(normalRaw);
    });
    await waitFor(() => expect(result.current.tool.state.status).toBe("success"));
    act(() => result.current.network.setNetwork("mainnet"));
    expect(result.current.tool.state.status).toBe("idle");
  });
});
