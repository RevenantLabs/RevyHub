import { http, HttpResponse } from "msw";
import { baseAccount, missingAccount } from "@/features/muxed-payment-routing-audit/fixtures/muxedPaymentRoutingAudit.fixture";
import { muxedPayments } from "@/features/muxed-payment-routing-audit/fixtures/muxed-payments.fixture";
import { directPayments } from "@/features/muxed-payment-routing-audit/fixtures/direct-payments.fixture";
export const normalRecords = [...muxedPayments, ...directPayments];
const origins = ["https://horizon-testnet.stellar.org", "https://horizon.stellar.org"];
export const handlers = origins.flatMap((origin) => [
  http.get(`${origin}/accounts/${baseAccount}/payments`, ({ request }) => {
    const cursor = new URL(request.url).searchParams.get("cursor");
    return HttpResponse.json({ _embedded: { records: cursor ? [] : normalRecords } });
  }),
  http.get(`${origin}/accounts/${missingAccount}/payments`, () => HttpResponse.json({ status: 404 }, { status: 404 }))
]);
export const paymentPath = `https://horizon-testnet.stellar.org/accounts/${baseAccount}/payments`;
export const rateLimitedHandler = http.get(paymentPath, () => HttpResponse.json({}, { status: 429 }));
export const badCursorHandler = http.get(paymentPath, () => HttpResponse.json({}, { status: 400 }));
export const failedHandler = http.get(paymentPath, () => HttpResponse.json({}, { status: 503 }));
export const malformedHandler = http.get(paymentPath, () => HttpResponse.json({ _embedded: { records: [{ ...directPayments[0], amount: "oops" }] } }));
