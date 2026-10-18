import { describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useSorobanFootprintDiff } from "@/features/soroban-footprint-diff/hooks/useSorobanFootprintDiff";
import {
  firstSimulationJson,
  secondSimulationJson
} from "@/features/soroban-footprint-diff/fixtures/sorobanFootprintDiff.fixture";

describe("useSorobanFootprintDiff", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useSorobanFootprintDiff());
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("compares footprints", async () => {
    const { result } = renderHook(() => useSorobanFootprintDiff());
    await act(async () => {
      await result.current.submit({
        firstResult: firstSimulationJson,
        secondResult: secondSimulationJson
      });
    });
    await waitFor(() => expect(result.current.state.status).toBe("success"));
  });

  it("surfaces empty first result", async () => {
    const { result } = renderHook(() => useSorobanFootprintDiff());
    await act(async () => {
      await result.current.submit({ firstResult: "", secondResult: secondSimulationJson });
    });
    expect(result.current.state).toEqual({ status: "error", code: "empty_first_result" });
  });

  it("resets", async () => {
    const { result } = renderHook(() => useSorobanFootprintDiff());
    await act(async () => {
      await result.current.submit({
        firstResult: firstSimulationJson,
        secondResult: secondSimulationJson
      });
    });
    await waitFor(() => expect(result.current.state.status).toBe("success"));
    act(() => result.current.reset());
    expect(result.current.state).toEqual({ status: "idle" });
  });
});
