import { describe, expect, it } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { NetworkProvider } from "@/core/network/NetworkProvider";
import { withMswHandlers } from "@/core/testing/msw";
import { useSimulationExplainer } from "@/features/simulation-explainer/hooks/useSimulationExplainer";
import { handlers } from "@/features/simulation-explainer/msw/handlers";
import { validTransactionXdr } from "@/features/simulation-explainer/fixtures/simulationExplainer.fixture";

withMswHandlers(...handlers);

function wrapper({ children }: { children: React.ReactNode }) {
  return <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;
}

describe("useSimulationExplainer", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useSimulationExplainer(), { wrapper });
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("loads a simulation result for a valid envelope", async () => {
    const { result } = renderHook(() => useSimulationExplainer(), { wrapper });

    await act(async () => {
      await result.current.submit(validTransactionXdr);
    });

    await waitFor(() => expect(result.current.state.status).toBe("success"));
    expect(result.current.state).toMatchObject({
      result: { kind: "success", minResourceFee: "12345" }
    });
  });

  it("rejects empty input before making a request", async () => {
    const { result } = renderHook(() => useSimulationExplainer(), { wrapper });

    await act(async () => {
      await result.current.submit("   ");
    });

    expect(result.current.state).toEqual({ status: "error", code: "empty_input" });
  });

  it("rejects input that is not a valid transaction envelope", async () => {
    const { result } = renderHook(() => useSimulationExplainer(), { wrapper });

    await act(async () => {
      await result.current.submit("not-valid-xdr");
    });

    expect(result.current.state).toEqual({ status: "error", code: "invalid_xdr" });
  });

  it("clears the result on reset", async () => {
    const { result } = renderHook(() => useSimulationExplainer(), { wrapper });

    await act(async () => {
      await result.current.submit(validTransactionXdr);
    });
    await waitFor(() => expect(result.current.state.status).toBe("success"));

    act(() => result.current.reset());
    expect(result.current.state).toEqual({ status: "idle" });
  });
});
