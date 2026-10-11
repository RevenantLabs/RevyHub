import { http, HttpResponse } from "msw";

const TESTNET_RPC = "https://soroban-testnet.stellar.org";
const MAINNET_RPC = "https://mainnet.sorobanrpc.com";

export const calmFeeStats = {
  sorobanInclusionFee: {
    max: "300",
    min: "100",
    mode: "210",
    p10: "120",
    p20: "150",
    p30: "180",
    p40: "200",
    p50: "210",
    p60: "220",
    p70: "240",
    p80: "260",
    p90: "280",
    p95: "290",
    p99: "300",
  },
  inclusionFee: {
    max: "300",
    min: "100",
    mode: "210",
    p10: "120",
    p20: "150",
    p30: "180",
    p40: "200",
    p50: "210",
    p60: "220",
    p70: "240",
    p80: "260",
    p90: "280",
    p95: "290",
    p99: "300",
  },
  latestLedger: 1234567,
};

export const handlers = [
  http.post(TESTNET_RPC, async ({ request }) => {
    const body = (await request.json()) as { method?: string };
    if (body.method === "getFeeStats") {
      return HttpResponse.json({ jsonrpc: "2.0", id: 1, result: calmFeeStats });
    }
    return HttpResponse.json({ jsonrpc: "2.0", id: 1, error: { code: -32601, message: "Method not found" } }, { status: 200 });
  }),
  http.post(MAINNET_RPC, async ({ request }) => {
    const body = (await request.json()) as { method?: string };
    if (body.method === "getFeeStats") {
      return HttpResponse.json({ jsonrpc: "2.0", id: 1, result: calmFeeStats });
    }
    return HttpResponse.json({ jsonrpc: "2.0", id: 1, error: { code: -32601, message: "Method not found" } }, { status: 200 });
  }),
];
