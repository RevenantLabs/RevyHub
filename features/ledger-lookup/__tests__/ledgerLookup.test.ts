import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { withMswHandlers, http, HttpResponse } from "@/core/testing/msw";
import { horizonUrl, resetHorizonClients } from "@/core/horizon/client";
import { runLedgerLookup } from "../lib/ledgerLookup";
import { handlers } from "../msw/handlers";
import { ledgerLookupFixture as ledger, rootFixture, observedAt } from "../fixtures/ledgerLookup.fixture";
const server = withMswHandlers(...handlers);
beforeEach(resetHorizonClients); afterEach(() => vi.useRealTimers());
const url = horizonUrl("testnet", "/ledgers/900");
const run = (sequence = 900) => runLedgerLookup({sequence}, "testnet");
it("reads the ledger with separate counts and exact monetary fields", async () => {
 vi.useFakeTimers({toFake:["Date"]}); vi.setSystemTime(new Date(observedAt));
 expect(await run()).toEqual({ok:true,value:{sequence:900,closedAt:"2026-09-12T08:59:00.000Z",observedAt,successful:4,failed:2,operations:8,feePool:"900719925.4740993",totalCoins:"50000000000.0000000",baseFee:"100",baseReserve:"5000000",protocol:23}});
});
it("rejects future and pruned ledgers before requesting a ledger endpoint", async () => {
 let calls = 0; server.use(http.get(horizonUrl("testnet", "/ledgers/:sequence"), () => {calls++; return HttpResponse.json(ledger);}));
 expect(await run(1001)).toEqual({ok:false,code:"future_ledger",detail:{currentHeight:1000}}); expect(await run(99)).toEqual({ok:false,code:"ledger_not_found"}); expect(calls).toBe(0);
});
it.each([[404,"ledger_not_found"],[429,"rate_limited"],[500,"request_failed"]])("maps ledger HTTP %s", async (status, code) => {server.use(http.get(url, () => HttpResponse.json({status:Number(status), title:"Horizon error"},{status:Number(status)}))); expect(await run()).toEqual({ok:false,code});});
it("handles unavailable root and malformed current height", async () => {
 server.use(http.get(horizonUrl("testnet", "/"), () => HttpResponse.error())); expect(await run()).toEqual({ok:false,code:"request_failed"});
 resetHorizonClients(); server.use(http.get(horizonUrl("testnet", "/"), () => HttpResponse.json({...rootFixture,history_latest_ledger:null}))); expect(await run()).toEqual({ok:false,code:"request_failed"});
});
it("rejects malformed ledger data and retains missing optional fields as unknown", async () => {
 server.use(http.get(url, () => HttpResponse.json({...ledger,closed_at:"bad"}))); expect(await run()).toEqual({ok:false,code:"request_failed"}); resetHorizonClients();
 server.use(http.get(url, () => HttpResponse.json({sequence:900,closed_at:ledger.closed_at}))); const r = await run(); expect(r.ok && r.value.failed).toBe(null); expect(r.ok && r.value.feePool).toBe(null);
});
