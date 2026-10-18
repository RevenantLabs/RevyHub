import { http, HttpResponse } from "msw";
import { claimant, normalPage } from "../fixtures/claimableBalanceDeadlineBoard.fixture";
import { fullPage, secondPage } from "../fixtures/claimant-balances.fixture";
import { nestedBalance, malformedBalance } from "../fixtures/nested-deadlines.fixture";
export const handlers = [http.get("https://horizon-testnet.stellar.org/claimable_balances", ({ request }) => {
  const url = new URL(request.url);
  if (url.searchParams.get("claimant") !== claimant) return HttpResponse.json({ _embedded: { records: [] } });
  const cursor = url.searchParams.get("cursor");
  if (cursor === "900" || cursor === "1200" || cursor === "1400") {
    const offset = cursor === "900" ? 1000 : Number(cursor);
    return HttpResponse.json({ _embedded: { records: fullPage.map((record, index) => ({ ...record, paging_token: String(offset + index + 1) })) } });
  }
  if (cursor === "0") return HttpResponse.json({ _embedded: { records: fullPage } });
  if (cursor === "200") return HttpResponse.json({ _embedded: { records: secondPage } });
  if (cursor === "301") return HttpResponse.json({ _embedded: { records: [nestedBalance] } });
  if (cursor === "302") return HttpResponse.json({ _embedded: { records: [malformedBalance] } });
  if (cursor === "303") return HttpResponse.json({}, { status: 429 });
  if (cursor === "304") return HttpResponse.json({}, { status: 410 });
  if (cursor === "305") return HttpResponse.json({}, { status: 400 });
  if (cursor === "306") return HttpResponse.json({}, { status: 503 });
  return HttpResponse.json(normalPage);
})];
