import { http, HttpResponse } from "msw";
import {
  alreadyFundedBody,
  friendbotSuccess,
  fundedAccountId,
  newAccountId,
  rateLimitedAccountId
} from "@/features/testnet-faucet/fixtures/testnetFaucet.fixture";

const FRIENDBOT = "https://friendbot.stellar.org";

export const handlers = [
  http.get(FRIENDBOT, ({ request }) => {
    const addr = new URL(request.url).searchParams.get("addr");

    if (addr === newAccountId) return HttpResponse.json(friendbotSuccess);

    if (addr === fundedAccountId) {
      return new HttpResponse(alreadyFundedBody, {
        status: 400,
        headers: { "content-type": "application/json" }
      });
    }

    if (addr === rateLimitedAccountId) {
      return new HttpResponse("rate limited", { status: 429 });
    }

    return new HttpResponse("bad request", { status: 400 });
  })
];

export const unavailableHandler = http.get(
  FRIENDBOT,
  () => new HttpResponse("upstream failure", { status: 503 })
);

/** Success response whose body is not valid JSON. */
export const unparseableSuccessHandler = http.get(
  FRIENDBOT,
  () => new HttpResponse("<html>ok</html>", { status: 200 })
);
