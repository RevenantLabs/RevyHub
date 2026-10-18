import type { ReactNode } from "react";
import { expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { NetworkProvider, useNetwork } from "@/core/network/NetworkProvider";
import { withMswHandlers } from "@/core/testing/msw";
import { useSorobanEventFilterComposer } from "../hooks/useSorobanEventFilterComposer";
import { handlers } from "../msw/handlers";
import { sample } from "../fixtures/sorobanEventFilterComposer.fixture";

withMswHandlers(...handlers);
const wrapper = ({ children }: { children: ReactNode }) => <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;

it("loads a result and resets", async () => {
  const { result } = renderHook(useSorobanEventFilterComposer, { wrapper });
  expect(result.current.state.status).toBe("idle");
  await act(() => result.current.submit({ ...sample, contractIds: "" }));
  expect(result.current.state.status).toBe("error");
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

it("drops the page when the network changes", async () => {
  const { result } = renderHook(() => ({ tool: useSorobanEventFilterComposer(), network: useNetwork() }), { wrapper });
  await act(() => result.current.tool.submit(sample));
  expect(result.current.tool.state.status).toBe("success");
  act(() => result.current.network.setNetwork("mainnet"));
  expect(result.current.tool.state.status).toBe("idle");
});
