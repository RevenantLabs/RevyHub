import { describe, expect, it } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useSorobanAuthInspector } from "@/features/soroban-auth-inspector/hooks/useSorobanAuthInspector";
import {
  buildAuthTreeEnvelopeXdr,
  buildPaymentEnvelopeXdr
} from "@/features/soroban-auth-inspector/fixtures/sorobanAuthInspector.fixture";

describe("useSorobanAuthInspector", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useSorobanAuthInspector());
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("decodes a valid envelope", async () => {
    const { result } = renderHook(() => useSorobanAuthInspector());

    await act(async () => {
      await result.current.submit(buildAuthTreeEnvelopeXdr());
    });

    await waitFor(() => expect(result.current.state.status).toBe("success"));
    expect(result.current.state).toMatchObject({
      result: { kind: "auth", entries: expect.any(Array) }
    });
  });

  it("rejects empty input", async () => {
    const { result } = renderHook(() => useSorobanAuthInspector());

    await act(async () => {
      await result.current.submit("   ");
    });

    expect(result.current.state).toEqual({ status: "error", code: "empty_input" });
  });

  it("reports a non-Soroban envelope", async () => {
    const { result } = renderHook(() => useSorobanAuthInspector());

    await act(async () => {
      await result.current.submit(buildPaymentEnvelopeXdr());
    });

    expect(result.current.state).toEqual({ status: "error", code: "not_soroban" });
  });

  it("clears the result on reset", async () => {
    const { result } = renderHook(() => useSorobanAuthInspector());

    await act(async () => {
      await result.current.submit(buildAuthTreeEnvelopeXdr());
    });
    await waitFor(() => expect(result.current.state.status).toBe("success"));

    act(() => result.current.reset());
    expect(result.current.state).toEqual({ status: "idle" });
  });
});
