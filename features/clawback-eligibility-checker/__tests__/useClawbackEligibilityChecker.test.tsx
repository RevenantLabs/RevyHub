import type { ReactNode } from "react";
import { expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { NetworkProvider, useNetwork } from "@/core/network/NetworkProvider";
import { withMswHandlers } from "@/core/testing/msw";
import { useClawbackEligibilityChecker } from "../hooks/useClawbackEligibilityChecker";
import { handlers } from "../msw/handlers";
import { sample } from "../fixtures/clawbackEligibilityChecker.fixture";

withMswHandlers(...handlers);
const wrapper = ({ children }: { children: ReactNode }) => <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;

it("starts idle", () => {
  const { result } = renderHook(useClawbackEligibilityChecker, { wrapper });
  expect(result.current.state.status).toBe("idle");
});

it("loads a report and resets", async () => {
  const { result } = renderHook(useClawbackEligibilityChecker, { wrapper });
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

it("reports a validation error for an invalid account without a request", async () => {
  const { result } = renderHook(useClawbackEligibilityChecker, { wrapper });
  await act(async () => {
    await result.current.submit({ issuerAccountId: "not-an-account", holderAccountId: sample.holderAccountId, assetCode: sample.assetCode });
  });
  expect(result.current.state.status).toBe("error");
  expect(result.current.state.status === "error" && result.current.state.code).toBe("invalid_account");
});

it("drops the result when the header network changes", async () => {
  const { result } = renderHook(() => ({ tool: useClawbackEligibilityChecker(), network: useNetwork() }), { wrapper });
  await act(() => result.current.tool.submit(sample));
  act(() => result.current.network.setNetwork("mainnet"));
  expect(result.current.tool.state.status).toBe("idle");
});
