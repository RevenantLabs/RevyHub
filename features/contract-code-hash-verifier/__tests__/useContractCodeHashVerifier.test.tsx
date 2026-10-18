import type { ReactNode } from "react";
import { expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { NetworkProvider, useNetwork } from "@/core/network/NetworkProvider";
import { withMswHandlers } from "@/core/testing/msw";
import { useContractCodeHashVerifier } from "../hooks/useContractCodeHashVerifier";
import { handlers } from "../msw/handlers";
import { sample } from "../fixtures/contractCodeHashVerifier.fixture";

withMswHandlers(...handlers);
const wrapper = ({ children }: { children: ReactNode }) => <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;

it("loads a match and resets", async () => {
  const { result } = renderHook(useContractCodeHashVerifier, { wrapper });
  let pending: Promise<void>;
  act(() => { pending = result.current.submit(sample); });
  expect(result.current.state.status).toBe("loading");
  await act(async () => pending);
  expect(result.current.state.status).toBe("success");
  act(() => result.current.reset());
  expect(result.current.state.status).toBe("idle");
});

it("drops the result when the header network changes", async () => {
  const { result } = renderHook(() => ({ tool: useContractCodeHashVerifier(), network: useNetwork() }), { wrapper });
  await act(() => result.current.tool.submit(sample));
  act(() => result.current.network.setNetwork("mainnet"));
  expect(result.current.tool.state.status).toBe("idle");
});
