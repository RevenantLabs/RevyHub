import { delay, http, HttpResponse } from "msw";
import {
  accountId,
  emptyResponse,
  malformedResponse,
  pageOneResponse,
  pageTwoCursor,
  pageTwoResponse,
  quietAccountId,
  unknownAccountId
} from "@/features/effects-timeline/fixtures/effectsTimeline.fixture";

const TESTNET = "https://horizon-testnet.stellar.org";
const MAINNET = "https://horizon.stellar.org";

/** Serves the two fixture pages by cursor, the way Horizon does. */
function effectsHandlers(origin: string) {
  return [
    http.get(`${origin}/accounts/${accountId}/effects`, ({ request }) => {
      const cursor = new URL(request.url).searchParams.get("cursor");
      if (!cursor) return HttpResponse.json(pageOneResponse);
      if (cursor === pageTwoCursor) return HttpResponse.json(pageTwoResponse);
      return HttpResponse.json(emptyResponse);
    }),
    http.get(`${origin}/accounts/${quietAccountId}/effects`, () =>
      HttpResponse.json(emptyResponse)
    ),
    http.get(`${origin}/accounts/${unknownAccountId}/effects`, () =>
      HttpResponse.json(
        {
          type: "https://stellar.org/horizon-errors/not_found",
          title: "Resource Missing",
          status: 404
        },
        { status: 404 }
      )
    )
  ];
}

export const handlers = [...effectsHandlers(TESTNET), ...effectsHandlers(MAINNET)];

const effectsPath = `${TESTNET}/accounts/${accountId}/effects`;

export const rateLimitedHandler = http.get(effectsPath, () =>
  HttpResponse.json({ title: "Rate limit exceeded", status: 429 }, { status: 429 })
);

export const serverErrorHandler = http.get(effectsPath, () =>
  HttpResponse.json({ title: "Internal Server Error", status: 500 }, { status: 500 })
);

export const transportFailureHandler = http.get(effectsPath, () => HttpResponse.error());

export const malformedPageHandler = http.get(effectsPath, () =>
  HttpResponse.json(malformedResponse)
);

export const slowEffectsHandler = http.get(effectsPath, async () => {
  await delay(50);
  return HttpResponse.json(pageOneResponse);
});
