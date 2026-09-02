import { http, HttpResponse } from "msw";
import {
  contractId,
  emptyEventsResponse,
  getEventsResponse,
  latestLedger,
  unknownContractId
} from "@/features/contract-events/fixtures/contractEvents.fixture";

const TESTNET_RPC = "https://soroban-testnet.stellar.org";
const MAINNET_RPC = "https://mainnet.sorobanrpc.com";

function isJsonRpcRequest(body: unknown, method: string): boolean {
  return (
    typeof body === "object" &&
    body !== null &&
    (body as { method?: string }).method === method
  );
}

function getContractId(body: unknown): string | undefined {
  if (typeof body !== "object" || body === null) return undefined;
  const filters = (body as { params?: { filters?: { contractIds?: string[] }[] } }).params?.filters;
  return filters?.[0]?.contractIds?.[0];
}

/** Happy-path handlers for the Soroban RPC calls this slice makes. */
export const handlers = [
  http.post(TESTNET_RPC, async ({ request }) => {
    const body = await request.json();

    if (isJsonRpcRequest(body, "getLatestLedger")) {
      return HttpResponse.json({
        jsonrpc: "2.0",
        id: (body as { id?: number }).id ?? 1,
        result: { sequence: latestLedger }
      });
    }

    if (isJsonRpcRequest(body, "getEvents")) {
      const requestedContractId = getContractId(body);

      if (requestedContractId === contractId) {
        return HttpResponse.json({
          jsonrpc: "2.0",
          id: (body as { id?: number }).id ?? 1,
          result: getEventsResponse()
        });
      }

      if (requestedContractId === unknownContractId) {
        return HttpResponse.json({
          jsonrpc: "2.0",
          id: (body as { id?: number }).id ?? 1,
          result: emptyEventsResponse()
        });
      }

      return HttpResponse.json({
        jsonrpc: "2.0",
        id: (body as { id?: number }).id ?? 1,
        result: emptyEventsResponse()
      });
    }

    return HttpResponse.json(
      { error: { code: -32601, message: "Method not found" } },
      { status: 200 }
    );
  }),

  http.post(MAINNET_RPC, async ({ request }) => {
    const body = await request.json();

    if (isJsonRpcRequest(body, "getLatestLedger")) {
      return HttpResponse.json({
        jsonrpc: "2.0",
        id: (body as { id?: number }).id ?? 1,
        result: { sequence: 2_000_000 }
      });
    }

    if (isJsonRpcRequest(body, "getEvents")) {
      return HttpResponse.json({
        jsonrpc: "2.0",
        id: (body as { id?: number }).id ?? 1,
        result: getEventsResponse()
      });
    }

    return HttpResponse.json(
      { error: { code: -32601, message: "Method not found" } },
      { status: 200 }
    );
  })
];

export const rpcErrorHandler = http.post(TESTNET_RPC, async ({ request }) => {
  const body = await request.json();

  return HttpResponse.json({
    jsonrpc: "2.0",
    id: (body as { id?: number }).id ?? 1,
    error: { code: -32603, message: "Internal JSON-RPC error" }
  });
});

export const networkErrorHandler = http.post(TESTNET_RPC, () => HttpResponse.error());
