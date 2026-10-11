import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useKeypairGenerator } from "@/features/testnet-keypair-generator/hooks/useKeypairGenerator";
import { validSeed } from "@/features/testnet-keypair-generator/fixtures/keypairGenerator.fixture";

describe("useKeypairGenerator", () => {
  it("starts in idle state", () => {
    const { result } = renderHook(() => useKeypairGenerator());
    expect(result.current.state.status).toBe("idle");
  });

  it("generates keypair on generate()", () => {
    const { result } = renderHook(() => useKeypairGenerator());
    act(() => result.current.generate());
    expect(result.current.state.status).toBe("success");
    if (result.current.state.status === "success") {
      expect(result.current.state.keypair.publicKey.startsWith("G")).toBe(true);
    }
  });

  it("derives keypair from seed", () => {
    const { result } = renderHook(() => useKeypairGenerator());
    act(() => result.current.derive(validSeed));
    expect(result.current.state.status).toBe("success");
  });

  it("returns error for invalid seed", () => {
    const { result } = renderHook(() => useKeypairGenerator());
    act(() => result.current.derive("SINVALID"));
    expect(result.current.state.status).toBe("error");
  });

  it("returns to idle on reset", () => {
    const { result } = renderHook(() => useKeypairGenerator());
    act(() => result.current.generate());
    act(() => result.current.reset());
    expect(result.current.state.status).toBe("idle");
  });
});
