import type { ReactNode } from "react";
import { expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { NetworkProvider, useNetwork } from "@/core/network/NetworkProvider";
import { withMswHandlers } from "@/core/testing/msw";
import { useContractCallArgumentChecker } from "../hooks/useContractCallArgumentChecker";
import { handlers } from "../msw/handlers";
import { sample } from "../fixtures/contractCallArgumentChecker.fixture";

withMswHandlers(...handlers);
const wrapper = ({ children }: { children: ReactNode }) => <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;

it("checks locally, resets, and ignores a stale completion", async () => {
  const { result } = renderHook(useContractCallArgumentChecker, { wrapper });
  expect(result.current.state.status).toBe("idle");
  let pending: Promise<void>;
  act(() => { pending = result.current.submit(sample); });
  expect(result.current.state.status).toBe("loading");
  await act(async () => pending);
  expect(result.current.state.status).toBe("success");
  act(() => result.current.reset());
  expect(result.current.state.status).toBe("idle");
});

it("hides a local result when the header network changes", async () => {
  const { result } = renderHook(() => ({ tool: useContractCallArgumentChecker(), network: useNetwork() }), { wrapper });
  await act(() => result.current.tool.submit(sample));
  act(() => result.current.network.setNetwork("mainnet"));
  expect(result.current.tool.state.status).toBe("idle");
});
