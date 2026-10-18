import { Keypair } from "@stellar/stellar-sdk";
import type { OperationBrowserResult, OperationSummary } from "@/features/operation-browser/types";
import { normalizeHorizonOperation, PAGE_SIZE, type RawHorizonOperation } from "@/features/operation-browser/lib/operationBrowser";

const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const accountId = seed(11).publicKey();
export const counterpartyId = seed(12).publicKey();
export const issuerId = seed(13).publicKey();
export const unknownAccountId = seed(14).publicKey();
export const secretSeed = seed(15).secret();

export const paymentTxHash =
  "3389e74f084d1d7db30bcf2c28fe96637a30ca69638fc122fce548f0d6a77016";
export const failedTxHash =
  "a1b2c3d4e5f6789012345678901234567890123456789012345678901234abcd";

function rawOperation(
  id: string,
  pagingToken: string,
  overrides: Partial<RawHorizonOperation>
): RawHorizonOperation {
  return {
    id,
    paging_token: pagingToken,
    type: "payment",
    type_i: 1,
    source_account: accountId,
    created_at: "2024-01-15T12:00:00Z",
    transaction_hash: paymentTxHash,
    transaction_successful: true,
    to: counterpartyId,
    from: accountId,
    amount: "10.0000000",
    asset_type: "native",
    ...overrides
  };
}

export const pageOneRecords: RawHorizonOperation[] = Array.from({ length: 20 }, (_, index) => {
  const id = String(100001 + index);
  if (index === 0) {
    return rawOperation(id, id, {
      type: "payment",
      type_i: 1,
      amount: "10.0000000",
      asset_type: "native",
      to: counterpartyId
    });
  }
  if (index === 1) {
    return rawOperation(id, id, {
      type: "change_trust",
      type_i: 6,
      asset_type: "credit_alphanum4",
      asset_code: "USDC",
      asset_issuer: issuerId,
      limit: "1000.0000000",
      trustor: accountId
    });
  }
  if (index === 2) {
    return rawOperation(id, id, {
      type: "manage_sell_offer",
      type_i: 7,
      offer_id: 42,
      amount: "50.0000000",
      price: "0.1200000",
      asset_type: "credit_alphanum4",
      asset_code: "USDC",
      asset_issuer: issuerId
    });
  }
  return rawOperation(id, id, {
    type: "payment",
    type_i: 1,
    amount: "1.0000000",
    asset_type: "native",
    to: counterpartyId
  });
});

export const pageTwoRecords: RawHorizonOperation[] = [
  rawOperation("100004", "100004", {
    type: "payment",
    type_i: 1,
    transaction_hash: failedTxHash,
    transaction_successful: false,
    amount: "1.0000000",
    asset_type: "native",
    to: counterpartyId
  })
];

export const pageOneOperations: OperationSummary[] = pageOneRecords.map(normalizeHorizonOperation);
export const pageTwoOperations: OperationSummary[] = pageTwoRecords.map(normalizeHorizonOperation);

export const pageOneCursor = pageOneRecords.at(-1)!.paging_token;

export function operationsCollection(records: RawHorizonOperation[]) {
  return {
    _embedded: { records },
    _links: {
      self: { href: "" },
      next: records.length ? { href: "" } : undefined,
      prev: { href: "" }
    }
  };
}

export const operationBrowserFixture: OperationBrowserResult = {
  accountId,
  pages: [pageOneOperations],
  pageIndex: 0,
  hasMoreOlder: pageOneRecords.length === PAGE_SIZE,
  typeFilter: "all"
};

export const multiPageFixture: OperationBrowserResult = {
  accountId,
  pages: [pageOneOperations, pageTwoOperations],
  pageIndex: 1,
  hasMoreOlder: false,
  typeFilter: "all"
};
