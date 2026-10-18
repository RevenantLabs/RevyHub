import { http, HttpResponse } from "msw";
import { SOROBAN_RPC_URLS } from "@/core/network/config";
import { emptyContractId, sampleEvent } from "../fixtures/sorobanEventFilterComposer.fixture";

function rpc(result: unknown) {
  return HttpResponse.json({ jsonrpc: "2.0", id: 1, result });
}

export const handlers = [
  http.post(SOROBAN_RPC_URLS.testnet, async ({ request }) => {
    const body = (await request.json()) as { method?: string; params?: { startLedger?: number; filters?: Array<{ contractIds?: string[] }> } };
    if (body.method === "getLatestLedger") {
      return rpc({ sequence: 500, oldestLedger: 100 });
    }
    if (body.method === "getEvents") {
      const id = body.params?.filters?.[0]?.contractIds?.[0];
      return rpc({
        events: id === emptyContractId ? [] : [sampleEvent],
        oldestLedger: 100,
        latestLedger: 500,
        cursor: id === emptyContractId ? undefined : "cursor-1"
      });
    }
    return HttpResponse.json({ jsonrpc: "2.0", id: 1, error: { code: -1, message: "unknown method" } });
  })
];
