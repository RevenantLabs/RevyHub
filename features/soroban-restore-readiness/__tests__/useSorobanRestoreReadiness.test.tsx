import type { ReactNode } from "react";
import { expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { NetworkProvider, useNetwork } from "@/core/network/NetworkProvider";
import { withMswHandlers } from "@/core/testing/msw";
import { useSorobanRestoreReadiness } from "../hooks/useSorobanRestoreReadiness";
import { handlers } from "../msw/handlers";
import { sample } from "../fixtures/sorobanRestoreReadiness.fixture";

withMswHandlers(...handlers);
const wrapper = ({ children }: { children: ReactNode }) => <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;

it("starts idle", () => {
  const { result } = renderHook(useSorobanRestoreReadiness, { wrapper });
  expect(result.current.state.status).toBe("idle");
});

it("loads a result and resets", async () => {
  const { result } = renderHook(useSorobanRestoreReadiness, { wrapper });
  let pending: Promise<void>;
  act(() => {
    pending = result.current.submit(sample);
  });
  expect(result.current.state.status).toBe("loading");
  await act(async () => pending);
  expect(result.current.state.status).toBe("success");
  act(() => result.current.reset());
  expect(result.current.state.status).toBe("idle");
});

it("reports a validation error for an invalid contract ID without a request", async () => {
  const { result } = renderHook(useSorobanRestoreReadiness, { wrapper });
  await act(async () => {
    await result.current.submit({ contractId: "not-a-contract", storageKeyXdr: sample.storageKeyXdr, durability: "persistent" });
  });
  expect(result.current.state.status).toBe("error");
  expect(result.current.state.status === "error" && result.current.state.code).toBe("invalid_contract_id");
});

it("drops the result when the header network changes", async () => {
  const { result } = renderHook(() => ({ tool: useSorobanRestoreReadiness(), network: useNetwork() }), { wrapper });
  await act(() => result.current.tool.submit(sample));
  act(() => result.current.network.setNetwork("mainnet"));
  expect(result.current.tool.state.status).toBe("idle");
});
