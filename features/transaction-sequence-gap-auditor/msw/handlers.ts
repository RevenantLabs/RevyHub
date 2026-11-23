import { http, HttpResponse } from "msw";
import { horizonUrl } from "@/core/horizon/client";
import {
  duplicatePageRecords,
  incompleteWindowPages,
  provedBumpOperations,
  provedBumpRecords
} from "@/features/transaction-sequence-gap-auditor/fixtures/boundary.fixture";
import {
  accountId,
  normalPage
} from "@/features/transaction-sequence-gap-auditor/fixtures/normal.fixture";

export const handlers = [
  http.get(horizonUrl("testnet", `/accounts/${accountId}/transactions`), () =>
    HttpResponse.json(normalPage)
  ),
  http.get(horizonUrl("mainnet", `/accounts/${accountId}/transactions`), () =>
    HttpResponse.json(normalPage)
  )
];

export const rateLimitedHandler = http.get(
  horizonUrl("testnet", `/accounts/${accountId}/transactions`),
  () => HttpResponse.json({ title: "Rate limit exceeded" }, { status: 429 })
);

export const notFoundHandler = http.get(
  horizonUrl("testnet", `/accounts/${accountId}/transactions`),
  () => HttpResponse.json({ title: "Resource Missing" }, { status: 404 })
);

export const malformedHandler = http.get(
  horizonUrl("testnet", `/accounts/${accountId}/transactions`),
  () => HttpResponse.json({ _embedded: { records: [{ hash: "broken" }] } })
);

export const duplicatePageHandler = http.get(
  horizonUrl("testnet", `/accounts/${accountId}/transactions`),
  () => HttpResponse.json({ _embedded: { records: duplicatePageRecords } })
);

export const incompleteWindowHandlers = [
  http.get(
    horizonUrl("testnet", `/accounts/${accountId}/transactions`),
    ({ request }) => {
      const cursor = new URL(request.url).searchParams.get("cursor");
      const index = cursor
        ? incompleteWindowPages.findIndex(
            (page) => page._embedded.records.at(-1)?.paging_token === cursor
          ) + 1
        : 0;
      return HttpResponse.json(incompleteWindowPages[Math.min(index, 4)]);
    }
  ),
  http.get(horizonUrl("testnet", "/transactions/:hash/operations"), () =>
    HttpResponse.json({ _embedded: { records: [] } })
  )
];

export const provedBumpHandlers = [
  http.get(horizonUrl("testnet", `/accounts/${accountId}/transactions`), () =>
    HttpResponse.json({ _embedded: { records: provedBumpRecords } })
  ),
  http.get(horizonUrl("testnet", `/transactions/${provedBumpRecords[1]!.hash}/operations`), () =>
    HttpResponse.json(provedBumpOperations)
  )
];
