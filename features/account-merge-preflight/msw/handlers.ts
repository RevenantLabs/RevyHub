import { http, HttpResponse } from "msw";
import { sourceId, destinationId, source2Id, baseAccountRecord, sponsorId } from "@/features/account-merge-preflight/fixtures/account-merge-preflight.fixture";

const TESTNET = "https://horizon-testnet.stellar.org";

export const handlers = [
  http.get(`${TESTNET}/accounts/:id`, ({ params }) => {
    if (params.id === destinationId) {
      return HttpResponse.json({ ...baseAccountRecord, id: destinationId, account_id: destinationId });
    }
    if (params.id === sourceId) {
      return HttpResponse.json(baseAccountRecord);
    }
    if (params.id === source2Id) {
      return HttpResponse.json({
        ...baseAccountRecord,
        id: source2Id,
        account_id: source2Id,
        balances: [
          { balance: "10.0000000", asset_type: "credit_alphanum4", asset_code: "USDC", asset_issuer: sponsorId },
          { balance: "100.0000000", asset_type: "native" }
        ],
        data_attr: { "test_data": "value" },
        signers: [
          { key: source2Id, weight: 1, type: "ed25519_public_key" },
          { key: sponsorId, weight: 1, type: "ed25519_public_key" }
        ],
        num_sponsoring: 1,
        sponsor: sponsorId,
      });
    }
    return HttpResponse.json({ status: 404, title: "Resource Missing" }, { status: 404 });
  }),
  http.get(`${TESTNET}/accounts/:id/offers`, ({ params }) => {
    if (params.id === source2Id) {
      return HttpResponse.json({
        _embedded: {
          records: [{ id: "123", seller: source2Id, selling: { asset_type: "native" }, buying: { asset_type: "native" }, amount: "1", price_r: { n: 1, d: 1 }, price: "1" }]
        }
      });
    }
    return HttpResponse.json({ _embedded: { records: [] } });
  })
];
