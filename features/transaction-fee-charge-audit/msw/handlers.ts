import { http, HttpResponse } from "msw";
import { horizonUrl } from "@/core/horizon/client";
import {
  classicHash,
  classicHorizonTransaction,
  classicLedgerRecord,
  CLASSIC_LEDGER,
  feeBumpHash,
  feeBumpHorizonTransaction,
  feeBumpLedgerRecord,
  FEE_BUMP_LEDGER,
  malformedFeeHash,
  malformedFeeHorizonTransaction,
  missingHash,
  missingLedgerHash,
  missingLedgerHorizonTransaction,
  MISSING_LEDGER
} from "@/features/transaction-fee-charge-audit/fixtures/classic-fee.fixture";

const network = "testnet" as const;

export const handlers = [
  http.get(horizonUrl(network, `/transactions/${classicHash}`), () =>
    HttpResponse.json(classicHorizonTransaction)
  ),
  http.get(horizonUrl(network, `/ledgers/${CLASSIC_LEDGER}`), () =>
    HttpResponse.json(classicLedgerRecord)
  ),
  http.get(horizonUrl(network, `/transactions/${feeBumpHash}`), () =>
    HttpResponse.json(feeBumpHorizonTransaction)
  ),
  http.get(horizonUrl(network, `/ledgers/${FEE_BUMP_LEDGER}`), () =>
    HttpResponse.json(feeBumpLedgerRecord)
  ),
  http.get(horizonUrl(network, `/transactions/${malformedFeeHash}`), () =>
    HttpResponse.json(malformedFeeHorizonTransaction)
  ),
  http.get(horizonUrl(network, `/transactions/${missingLedgerHash}`), () =>
    HttpResponse.json(missingLedgerHorizonTransaction)
  ),
  http.get(horizonUrl(network, `/ledgers/${MISSING_LEDGER}`), () =>
    HttpResponse.json({ title: "Resource Missing", status: 404 }, { status: 404 })
  ),
  http.get(horizonUrl(network, `/transactions/${missingHash}`), () =>
    HttpResponse.json({ title: "Resource Missing", status: 404 }, { status: 404 })
  )
];
