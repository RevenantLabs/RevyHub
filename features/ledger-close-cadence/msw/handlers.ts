import { http, HttpResponse } from "msw";
import { horizonUrl } from "@/core/horizon/client";
import {
  gapsFixture,
  ledgerCloseCadenceFixture
} from "@/features/ledger-close-cadence/fixtures/ledgerCloseCadence.fixture";

export const handlers = [
  http.get(horizonUrl("testnet", "/ledgers"), () => HttpResponse.json(ledgerCloseCadenceFixture)),
  http.get(horizonUrl("mainnet", "/ledgers"), () => HttpResponse.json(gapsFixture))
];

export const gapsHandler = http.get(horizonUrl("testnet", "/ledgers"), () =>
  HttpResponse.json(gapsFixture)
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
    _embedded: {
      records: [{ sequence: "bad", closed_at: "nope" }, { sequence: 1 }]
    }
  })
);
