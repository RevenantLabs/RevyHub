import { expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { NetworkProvider, useNetwork } from "@/core/network/NetworkProvider";
import { withMswHandlers, http, HttpResponse, delay } from "@/core/testing/msw";
import { horizonUrl, resetHorizonClients } from "@/core/horizon/client";
import { handlers } from "../msw/handlers";
import { ledgerLookupFixture } from "../fixtures/ledgerLookup.fixture";
import { useLedgerLookup } from "../hooks/useLedgerLookup";
const server = withMswHandlers(...handlers);
const wrapper = ({children}: {children: React.ReactNode}) => <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;
it("validates, loads a result and resets", async () => {
 resetHorizonClients(); const {result} = renderHook(useLedgerLookup, {wrapper}); expect(result.current.state.status).toBe("idle"); await act(() => result.current.submit("")); expect(result.current.state.status).toBe("error");
 let pending: Promise<void>; act(() => {pending = result.current.submit("900");}); expect(result.current.state.status).toBe("loading"); await act(async () => pending); expect(result.current.state.status).toBe("success"); act(() => result.current.reset()); expect(result.current.state.status).toBe("idle");
});
it("invalid newer input supersedes an in-flight success", async () => {
 resetHorizonClients(); server.use(http.get(horizonUrl("testnet", "/ledgers/900"), async () => {await delay(50);return HttpResponse.json(ledgerLookupFixture);}));
 const {result} = renderHook(useLedgerLookup,{wrapper}); let pending:Promise<void>; act(() => {pending = result.current.submit("900");}); await act(() => result.current.submit("invalid")); await act(async () => pending); expect(result.current.state).toEqual({status:"error",code:"invalid_sequence"});
});
it("hides data after changing networks", async () => {resetHorizonClients(); const {result} = renderHook(() => ({tool:useLedgerLookup(),network:useNetwork()}),{wrapper}); await act(() => result.current.tool.submit("900")); act(() => result.current.network.setNetwork("mainnet")); expect(result.current.tool.state.status).toBe("idle");});
