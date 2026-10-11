import { http, HttpResponse } from "msw";
import { buildContractInstanceLedgerKey } from "@/features/contract-storage/lib/contractStorage";
import {
  contractId,
  latestLedgerResponse,
  ledgerEntriesResponse
} from "@/features/contract-storage/fixtures/contractStorage.fixture";

const TESTNET_RPC = "https://soroban-testnet.stellar.org";
const MAINNET_RPC = "https://mainnet.sorobanrpc.com";

const testnetContractKey = buildContractInstanceLedgerKey(contractId);

function isJsonRpcRequest(body: unknown, method: string): boolean {
  return (
    typeof body === "object" &&
    body !== null &&
    (body as { method?: string }).method === method
  );
}

function getRequestKeys(body: unknown): string[] {
  if (typeof body !== "object" || body === null) return [];
  const params = (body as { params?: { keys?: string[] } }).params;
  return params?.keys ?? [];
}

/** Happy-path handlers for the Soroban RPC calls this slice makes. */
export const handlers = [
  http.post(TESTNET_RPC, async ({ request }) => {
    const body = await request.json();

    if (isJsonRpcRequest(body, "getLatestLedger")) {
      return HttpResponse.json({
        jsonrpc: "2.0",
        id: (body as { id?: number }).id ?? 1,
        result: latestLedgerResponse()
      });
    }

    if (isJsonRpcRequest(body, "getLedgerEntries")) {
      const keys = getRequestKeys(body);
      const found = keys.some((key) => key === testnetContractKey);

      return HttpResponse.json({
        jsonrpc: "2.0",
        id: (body as { id?: number }).id ?? 1,
        result: found ? ledgerEntriesResponse() : { entries: [], latestLedger: 1_000_000 }
      });
    }

    return HttpResponse.json({ error: { code: -32601, message: "Method not found" } }, { status: 200 });
  }),

  http.post(MAINNET_RPC, async ({ request }) => {
    const body = await request.json();

    if (isJsonRpcRequest(body, "getLatestLedger")) {
      return HttpResponse.json({
        jsonrpc: "2.0",
        id: (body as { id?: number }).id ?? 1,
        result: latestLedgerResponse(2_000_000)
      });
    }

    if (isJsonRpcRequest(body, "getLedgerEntries")) {
      return HttpResponse.json({
        jsonrpc: "2.0",
        id: (body as { id?: number }).id ?? 1,
        result: ledgerEntriesResponse(contractId, 2_000_500)
      });
    }

    return HttpResponse.json({ error: { code: -32601, message: "Method not found" } }, { status: 200 });
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

export const networkErrorHandler = http.post(TESTNET_RPC, () =>
  HttpResponse.error()
);
