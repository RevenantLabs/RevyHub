import { http, HttpResponse } from "msw";
import {
  degradedHorizonTestnet,
  healthyHorizonMainnet,
  healthyHorizonTestnet,
  malformedHorizonResponse
} from "@/features/horizon-health/fixtures/horizonHealth.fixture";

const TESTNET = "https://horizon-testnet.stellar.org";
const MAINNET = "https://horizon.stellar.org";

export const handlers = [
  http.get(`${TESTNET}/`, () =>
    HttpResponse.json(healthyHorizonTestnet, {
      headers: {
        "x-ratelimit-limit": "3600",
        "x-ratelimit-remaining": "3590",
        "x-ratelimit-reset": "3600"
      }
    })
  ),
  http.get(TESTNET, () =>
    HttpResponse.json(healthyHorizonTestnet, {
      headers: {
        "x-ratelimit-limit": "3600",
        "x-ratelimit-remaining": "3590",
        "x-ratelimit-reset": "3600"
      }
    })
  ),
  http.get(`${MAINNET}/`, () =>
    HttpResponse.json(healthyHorizonMainnet, {
      headers: {
        "x-ratelimit-limit": "7200",
        "x-ratelimit-remaining": "7150",
        "x-ratelimit-reset": "3600"
      }
    })
  ),
  http.get(MAINNET, () =>
    HttpResponse.json(healthyHorizonMainnet, {
      headers: {
        "x-ratelimit-limit": "7200",
        "x-ratelimit-remaining": "7150",
        "x-ratelimit-reset": "3600"
      }
    })
  )
];

export const degradedHandler = http.get(`${TESTNET}/`, () =>
  HttpResponse.json(degradedHorizonTestnet, {
    headers: {
      "x-ratelimit-limit": "3600",
      "x-ratelimit-remaining": "3580",
      "x-ratelimit-reset": "3600"
    }
  })
);

export const noRateLimitHandler = http.get(`${TESTNET}/`, () =>
  HttpResponse.json(healthyHorizonTestnet)
);

export const malformedHandler = http.get(`${TESTNET}/`, () =>
  HttpResponse.json(malformedHorizonResponse)
);

export const unreachableHandler = http.get(`${TESTNET}/`, () =>
  HttpResponse.error()
);

export const serverErrorHandler = http.get(`${TESTNET}/`, () =>
  HttpResponse.json({ title: "Internal Server Error" }, { status: 500 })
);
