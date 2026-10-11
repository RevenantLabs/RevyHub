import { http, HttpResponse } from "msw";

const sampleOffers = {
  _embedded: {
    records: [
      {
        id: "12345",
        seller: "GAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB",
        selling: { asset_type: "native" },
        buying: { asset_type: "credit_alphanum4", asset_code: "USDC", asset_issuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN" },
        amount: "100.0000000",
        price: "1.0000000",
        price_n: 1,
        price_d: 1,
        last_modified_ledger: 12345,
        last_modified_time: "2026-01-15T10:30:00Z",
      },
    ],
  },
};

export const handlers = [
  http.get("*/accounts/*/offers", () => {
    return HttpResponse.json(sampleOffers);
  }),
];
