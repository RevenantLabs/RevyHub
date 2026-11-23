import { http, HttpResponse } from "msw"
import { HORIZON_URLS } from "@/core/network/config"
import {
  accountBody,
  assetBody,
  downIssuer,
  leftIssuer,
  missingIssuer,
  rightIssuer
} from "@/features/cross-network-asset-parity-report/fixtures/normal.fixture"

function assets(network: "testnet" | "mainnet") {
  return http.get(`${HORIZON_URLS[network]}/assets`, ({ request }) => {
    const issuer = new URL(request.url).searchParams.get("asset_issuer")
    const code = new URL(request.url).searchParams.get("asset_code") ?? "USDC"
    if (issuer === leftIssuer || issuer === rightIssuer) {
      return HttpResponse.json(assetBody(code, issuer))
    }
    return HttpResponse.json({ _embedded: { records: [] } })
  })
}

export const handlers = [
  http.get(`${HORIZON_URLS.testnet}/accounts/${leftIssuer}`, () => HttpResponse.json(accountBody("left.example", true))),
  http.get(`${HORIZON_URLS.mainnet}/accounts/${rightIssuer}`, () => HttpResponse.json(accountBody("right.example", false))),
  http.get(`${HORIZON_URLS.mainnet}/accounts/${missingIssuer}`, () =>
    HttpResponse.json({ title: "Resource Missing" }, { status: 404 })
  ),
  http.get(`${HORIZON_URLS.testnet}/accounts/${missingIssuer}`, () =>
    HttpResponse.json({ title: "Resource Missing" }, { status: 404 })
  ),
  http.get(`${HORIZON_URLS.mainnet}/accounts/${downIssuer}`, () =>
    HttpResponse.json({ title: "Server Error" }, { status: 500 })
  ),
  assets("testnet"),
  assets("mainnet")
]
