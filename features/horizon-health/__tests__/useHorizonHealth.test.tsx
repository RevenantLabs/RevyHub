import { expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { NetworkProvider, useNetwork } from "@/core/network/NetworkProvider";
import { withMswHandlers, http, HttpResponse, delay } from "@/core/testing/msw";
import { horizonUrl } from "@/core/horizon/client";
import { handlers } from "../msw/handlers";
import { horizonHealthFixture } from "../fixtures/horizonHealth.fixture";
import { useHorizonHealth } from "../hooks/useHorizonHealth";
const server = withMswHandlers(...handlers);
const wrapper = ({children}: {children: React.ReactNode}) => <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;
it("transitions idle, loading, success and reset", async () => {
 const {result} = renderHook(useHorizonHealth, {wrapper}); expect(result.current.state.status).toBe("idle");
 let pending: Promise<void>; act(() => {pending = result.current.submit();}); expect(result.current.state.status).toBe("loading");
 await act(async () => pending); expect(result.current.state.status).toBe("success"); act(() => result.current.reset()); expect(result.current.state.status).toBe("idle");
});
it("hides results after network switch", async () => {
 const {result} = renderHook(() => ({tool: useHorizonHealth(), network: useNetwork()}), {wrapper});
 await act(() => result.current.tool.submit()); act(() => result.current.network.setNetwork("mainnet")); expect(result.current.tool.state.status).toBe("idle");
});
it("reset prevents a pending response from restoring results", async () => {
 server.use(http.get(horizonUrl("testnet", "/"), async () => {await delay(50); return HttpResponse.json(horizonHealthFixture);}));
 const {result} = renderHook(useHorizonHealth, {wrapper}); let pending: Promise<void>;
 act(() => {pending = result.current.submit();}); act(() => result.current.reset()); await act(async () => pending); expect(result.current.state.status).toBe("idle");
});
it("reports errors and allows retry", async () => {
 server.use(http.get(horizonUrl("testnet", "/"), () => HttpResponse.error())); const {result} = renderHook(useHorizonHealth, {wrapper});
 await act(() => result.current.submit()); expect(result.current.state.status).toBe("error"); server.resetHandlers(); await act(() => result.current.submit()); await waitFor(() => expect(result.current.state.status).toBe("success"));
});
