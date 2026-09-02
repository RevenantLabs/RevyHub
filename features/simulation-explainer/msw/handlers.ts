import { http, HttpResponse } from "msw";
import {
  simulationFailureResponse,
  simulationRestoreResponse,
  simulationSuccessResponse,
  validTransactionXdr
} from "@/features/simulation-explainer/fixtures/simulationExplainer.fixture";

const TESTNET_RPC = "https://soroban-testnet.stellar.org";
const MAINNET_RPC = "https://mainnet.sorobanrpc.com";

function isJsonRpcRequest(body: unknown, method: string): boolean {
  return (
    typeof body === "object" &&
    body !== null &&
    (body as { method?: string }).method === method
  );
}

function getTransactionParam(body: unknown): string | undefined {
  if (typeof body !== "object" || body === null) return undefined;
  return (body as { params?: { transaction?: string } }).params?.transaction;
}

/** Happy-path handlers for the Soroban RPC calls this slice makes. */
export const handlers = [
  http.post(TESTNET_RPC, async ({ request }) => {
    const body = await request.json();

    if (isJsonRpcRequest(body, "simulateTransaction")) {
      const tx = getTransactionParam(body);

      if (!tx || tx !== validTransactionXdr) {
        return HttpResponse.json({
          jsonrpc: "2.0",
          id: (body as { id?: number }).id ?? 1,
          result: simulationFailureResponse()
        });
      }

      return HttpResponse.json({
        jsonrpc: "2.0",
        id: (body as { id?: number }).id ?? 1,
        result: simulationSuccessResponse()
      });
    }

    return HttpResponse.json(
      { error: { code: -32601, message: "Method not found" } },
      { status: 200 }
    );
  }),

  http.post(MAINNET_RPC, async ({ request }) => {
    const body = await request.json();

    if (isJsonRpcRequest(body, "simulateTransaction")) {
      return HttpResponse.json({
        jsonrpc: "2.0",
        id: (body as { id?: number }).id ?? 1,
        result: simulationSuccessResponse()
      });
    }

    return HttpResponse.json(
      { error: { code: -32601, message: "Method not found" } },
      { status: 200 }
    );
  })
];

export const restoreRequiredHandler = http.post(TESTNET_RPC, async ({ request }) => {
  const body = await request.json();

  return HttpResponse.json({
    jsonrpc: "2.0",
    id: (body as { id?: number }).id ?? 1,
    result: simulationRestoreResponse()
  });
});

export const rpcErrorHandler = http.post(TESTNET_RPC, async ({ request }) => {
  const body = await request.json();

  return HttpResponse.json({
    jsonrpc: "2.0",
    id: (body as { id?: number }).id ?? 1,
    error: { code: -32603, message: "Internal JSON-RPC error" }
  });
});

export const networkErrorHandler = http.post(TESTNET_RPC, () => HttpResponse.error());
