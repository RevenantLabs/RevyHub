import { http, HttpResponse, type JsonBodyType } from "msw";
import {
  failedHash,
  failedTransaction,
  incompleteEffectsPage,
  incompleteHash,
  incompleteOperationsPage,
  incompleteTransaction,
  missingHash,
  paymentEffectsPage,
  paymentOperationsPage,
  successfulHash,
  successfulTransaction,
  unsupportedEffectsPage,
  unsupportedHash,
  unsupportedOperationsPage,
  unsupportedTransaction
} from "@/features/payment-receipt-reconciler/fixtures/paymentReceiptReconciler.fixture";
import {
  paymentReceiptEffectsPage,
  paymentReceiptHash,
  paymentReceiptOperationsPage,
  paymentReceiptTransaction
} from "@/features/payment-receipt-reconciler/fixtures/payment-receipt.fixture";
import {
  mixedEffectsEffectsPage,
  mixedEffectsHash,
  mixedEffectsOperationsPage,
  mixedEffectsTransaction
} from "@/features/payment-receipt-reconciler/fixtures/mixed-effects.fixture";

const TESTNET = "https://horizon-testnet.stellar.org";

function txHandlers(
  hash: string,
  transaction: JsonBodyType,
  operations: JsonBodyType,
  effects: JsonBodyType
) {
  return [
    http.get(`${TESTNET}/transactions/${hash}`, () => HttpResponse.json(transaction)),
    http.get(`${TESTNET}/transactions/${hash}/operations`, () =>
      HttpResponse.json(operations)
    ),
    http.get(`${TESTNET}/transactions/${hash}/effects`, () => HttpResponse.json(effects))
  ];
}

export const handlers = [
  ...txHandlers(successfulHash, successfulTransaction, paymentOperationsPage, paymentEffectsPage),
  ...txHandlers(failedHash, failedTransaction, paymentOperationsPage, paymentEffectsPage),
  ...txHandlers(
    unsupportedHash,
    unsupportedTransaction,
    unsupportedOperationsPage,
    unsupportedEffectsPage
  ),
  ...txHandlers(
    incompleteHash,
    incompleteTransaction,
    incompleteOperationsPage,
    incompleteEffectsPage
  ),
  ...txHandlers(
    paymentReceiptHash,
    paymentReceiptTransaction,
    paymentReceiptOperationsPage,
    paymentReceiptEffectsPage
  ),
  ...txHandlers(
    mixedEffectsHash,
    mixedEffectsTransaction,
    mixedEffectsOperationsPage,
    mixedEffectsEffectsPage
  ),
  http.get(`${TESTNET}/transactions/${missingHash}`, () =>
    HttpResponse.json({ title: "Resource Missing", status: 404 }, { status: 404 })
  )
];

/** Transaction resolves but the effects endpoint fails. */
export const effectsUnavailableHandler = http.get(
  `${TESTNET}/transactions/${successfulHash}/effects`,
  () => HttpResponse.json({ title: "Internal Server Error", status: 500 }, { status: 500 })
);
