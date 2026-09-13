import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useAssetDescriptorCodec } from "@/features/asset-descriptor-codec/hooks/useAssetDescriptorCodec";
import {
  credit4Fixture,
  nativeFixture,
  secretSeed
} from "@/features/asset-descriptor-codec/fixtures/assetDescriptorCodec.fixture";

describe("useAssetDescriptorCodec", () => {
  it("initializes in idle state", () => {
    const { result } = renderHook(() => useAssetDescriptorCodec());
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("encodes valid asset descriptor into success state", async () => {
    const { result } = renderHook(() => useAssetDescriptorCodec());

    await act(async () => {
      await result.current.submit("native");
    });

    expect(result.current.state.status).toBe("success");
    if (result.current.state.status !== "success") return;
    expect(result.current.state.result.canonicalDescriptor).toBe("native");
    expect(result.current.state.result.xdr).toBe(nativeFixture.xdr);
  });

  it("decodes valid Asset XDR into success state", async () => {
    const { result } = renderHook(() => useAssetDescriptorCodec());

    await act(async () => {
      await result.current.submit({
        mode: "decode",
        value: credit4Fixture.xdr
      });
    });

    expect(result.current.state.status).toBe("success");
    if (result.current.state.status !== "success") return;
    expect(result.current.state.result.canonicalDescriptor).toBe(
      credit4Fixture.canonicalDescriptor
    );
    expect(result.current.state.result.type).toBe("credit_alphanum4");
  });

  it("handles input validation errors gracefully", async () => {
    const { result } = renderHook(() => useAssetDescriptorCodec());

    await act(async () => {
      await result.current.submit("");
    });
    expect(result.current.state).toEqual({ status: "error", code: "empty_input" });

    await act(async () => {
      await result.current.submit(`USDC:${secretSeed}`);
    });
    expect(result.current.state).toEqual({ status: "error", code: "invalid_issuer" });
  });

  it("returns to idle when reset is invoked", async () => {
    const { result } = renderHook(() => useAssetDescriptorCodec());

    await act(async () => {
      await result.current.submit("native");
    });
    expect(result.current.state.status).toBe("success");

    act(() => {
      result.current.reset();
    });
    expect(result.current.state).toEqual({ status: "idle" });
  });
});
