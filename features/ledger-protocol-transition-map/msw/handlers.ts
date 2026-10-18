import { http, HttpResponse } from "msw";
import { horizonUrl } from "@/core/horizon/client";
import {
  ledgerProtocolTransitionMapFixture,
  missingLedgersFixture
} from "@/features/ledger-protocol-transition-map/fixtures/ledgerProtocolTransitionMap.fixture";

export const handlers = [
  http.get(horizonUrl("testnet", "/ledgers"), () =>
    HttpResponse.json(ledgerProtocolTransitionMapFixture)
  ),
  http.get(horizonUrl("mainnet", "/ledgers"), () => HttpResponse.json(missingLedgersFixture))
];

export const missingHandler = http.get(horizonUrl("testnet", "/ledgers"), () =>
  HttpResponse.json(missingLedgersFixture)
);

export const emptyHistoryHandler = http.get(horizonUrl("testnet", "/ledgers"), () =>
  HttpResponse.json({ _embedded: { records: [] } })
);

export const rateLimitedHandler = http.get(horizonUrl("testnet", "/ledgers"), () =>
  HttpResponse.json({ title: "Rate limit exceeded", status: 429 }, { status: 429 })
);

export const serverErrorHandler = http.get(horizonUrl("testnet", "/ledgers"), () =>
  HttpResponse.json({ title: "Server Error", status: 503 }, { status: 503 })
);

export const malformedOnlyHandler = http.get(horizonUrl("testnet", "/ledgers"), () =>
  HttpResponse.json({
    _embedded: { records: [{ sequence: "bad" }, { protocol_version: 20 }] }
  })
);
