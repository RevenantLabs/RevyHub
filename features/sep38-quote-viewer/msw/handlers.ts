import { http, HttpResponse } from "msw";
import {
  OFF_CHAIN_ASSET,
  ON_CHAIN_ASSET,
  QUOTE_SERVER,
  SELL_AMOUNT,
  TOML_URL,
  priceBody,
  tomlDocument
} from "@/features/sep38-quote-viewer/fixtures/sep38QuoteViewer.fixture";
import {
  SUPPORTED_AMOUNT,
  SUPPORTED_OFF_CHAIN,
  SUPPORTED_ON_CHAIN,
  supportedPriceBody
} from "@/features/sep38-quote-viewer/fixtures/supported-pair.fixture";
import {
  UNSUPPORTED_AMOUNT,
  UNSUPPORTED_ERROR,
  UNSUPPORTED_OFF_CHAIN
} from "@/features/sep38-quote-viewer/fixtures/unsupported-pair.fixture";

export function tomlHandler(body: string, status = 200) {
  return http.get(TOML_URL, () =>
    status === 200 ? HttpResponse.text(body) : new HttpResponse(null, { status })
  );
}

export const tomlMissingHandler = http.get(TOML_URL, () => new HttpResponse(null, { status: 404 }));

function matches(
  url: URL,
  sellAsset: string,
  buyAsset: string,
  sellAmount: string
): boolean {
  return (
    url.searchParams.get("sell_asset") === sellAsset &&
    url.searchParams.get("buy_asset") === buyAsset &&
    url.searchParams.get("sell_amount") === sellAmount
  );
}

/** Public stellar.toml and GET /price fixtures. Firm-quote routes are not mocked. */
export const handlers = [
  http.get(TOML_URL, () => HttpResponse.text(tomlDocument)),
  http.get(`${QUOTE_SERVER}/price`, ({ request }) => {
    const url = new URL(request.url);
    if (matches(url, OFF_CHAIN_ASSET, ON_CHAIN_ASSET, SELL_AMOUNT)) {
      return HttpResponse.json(priceBody);
    }
    if (matches(url, SUPPORTED_ON_CHAIN, SUPPORTED_OFF_CHAIN, SUPPORTED_AMOUNT)) {
      return HttpResponse.json(supportedPriceBody);
    }
    if (matches(url, UNSUPPORTED_OFF_CHAIN, ON_CHAIN_ASSET, UNSUPPORTED_AMOUNT)) {
      return HttpResponse.json({ error: UNSUPPORTED_ERROR }, { status: 400 });
    }
    return HttpResponse.json({ error: "unexpected price request" }, { status: 500 });
  })
];

export const priceNetworkError = http.get(`${QUOTE_SERVER}/price`, () => HttpResponse.error());

export const priceDecodeError = http.get(`${QUOTE_SERVER}/price`, () =>
  HttpResponse.text("<html>not json</html>", { status: 200 })
);
