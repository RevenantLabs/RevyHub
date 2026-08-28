import { http, HttpResponse } from "msw";

export const mockAssetRecord = {
  asset_type: "credit_alphanum4",
  asset_code: "USDC",
  asset_issuer: "GBBD47IF6LWK7P7MDEVSCWTTCJM4NUIQ35M4MPMHEUEH9DMB2UCA36GZ",
  paging_token: "USDC_GBBD47IF6LWK7P7MDEVSCWTTCJM4NUIQ35M4MPMHEUEH9DMB2UCA36GZ_credit_alphanum4",
  amount: "1234567.0000000",
  num_accounts: 12345,
  flags: {
    auth_required: false,
    auth_revocable: true,
    auth_immutable: false,
    clawback_enabled: true
  },
  accounts: {
    authorized: 12000,
    authorized_to_maintain_liabilities: 0,
    unauthorized: 345
  },
  balances: {
    authorized: "1234567.0000000",
    authorized_to_maintain_liabilities: "0.0000000",
    unauthorized: "0.0000000"
  },
  claimable_balances_amount: "50.0000000",
  num_claimable_balances: 2,
  liquidity_pools_amount: "0.0000000",
  num_liquidity_pools: 0
};

export const handlers = [
  http.get("*/assets", ({ request }) => {
    const url = new URL(request.url);
    const assetCode = url.searchParams.get("asset_code");
    const assetIssuer = url.searchParams.get("asset_issuer");

    if (assetCode === "USDC" && assetIssuer === "GBBD47IF6LWK7P7MDEVSCWTTCJM4NUIQ35M4MPMHEUEH9DMB2UCA36GZ") {
      return HttpResponse.json({
        _embedded: {
          records: [mockAssetRecord]
        }
      });
    }

    if (assetCode === "MISSING") {
      return HttpResponse.json({
        _embedded: {
          records: []
        }
      });
    }

    if (assetCode === "RATE") {
      return HttpResponse.json({ detail: "Rate limit exceeded" }, { status: 429 });
    }

    return HttpResponse.json({
      _embedded: { records: [] }
    });
  })
];
