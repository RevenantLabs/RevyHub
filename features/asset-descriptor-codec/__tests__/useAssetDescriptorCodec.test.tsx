import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAssetDescriptorCodec } from "@/features/asset-descriptor-codec/hooks/useAssetDescriptorCodec";

describe("useAssetDescriptorCodec", () => {
  it("starts in idle state", () => {
    const { result } = renderHook(() => useAssetDescriptorCodec());
    expect(result.current.state.status).toBe("idle");
  });

  it("converts native XLM to success", () => {
    const { result } = renderHook(() => useAssetDescriptorCodec());
    act(() => result.current.convert("XLM"));
    expect(result.current.state.status).toBe("success");
  });

  it("returns error for empty input", () => {
    const { result } = renderHook(() => useAssetDescriptorCodec());
    act(() => result.current.convert(""));
    expect(result.current.state.status).toBe("error");
    if (result.current.state.status === "error") {
      expect(result.current.state.code).toBe("empty_input");
    }
  });

  it("returns error for invalid issuer", () => {
    const { result } = renderHook(() => useAssetDescriptorCodec());
    act(() => result.current.convert("USD:not-a-valid-address"));
    expect(result.current.state.status).toBe("error");
    if (result.current.state.status === "error") {
      expect(result.current.state.code).toBe("invalid_issuer");
    }
  });

  it("returns to idle on reset", () => {
    const { result } = renderHook(() => useAssetDescriptorCodec());
    act(() => result.current.convert("XLM"));
    act(() => result.current.reset());
    expect(result.current.state.status).toBe("idle");
  });
});
