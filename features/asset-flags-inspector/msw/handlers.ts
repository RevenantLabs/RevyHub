import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("https://horizon-testnet.stellar.org/accounts/:accountId", () => {
    return HttpResponse.json({
      account_id: "GDFE4JDBVZY7EDCDBKNTBW6H2MGBOQKHY344B6OOKQ6Q7T5IIVX7N2R3",
      flags: {
        auth_required: false,
        auth_revocable: false,
        auth_immutable: false,
        auth_clawback_enabled: false,
      }
    });
  })
];
