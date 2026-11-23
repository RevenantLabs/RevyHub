import {
  accountId,
  transactionRecord
} from "@/features/transaction-sequence-gap-auditor/fixtures/normal.fixture";

export const bumpHash = "proved-bump-hash";
export const provedBumpRecords = [
  transactionRecord("50"),
  transactionRecord("10", { hash: bumpHash })
];

export const provedBumpOperations = {
  _embedded: {
    records: [
      {
        type: "bump_sequence",
        source_account: accountId,
        bump_to: "50",
        transaction_hash: bumpHash
      }
    ]
  }
};

export const failedEvidenceRecords = [
  transactionRecord("12"),
  transactionRecord("11", { successful: false }),
  transactionRecord("10")
];

export const duplicatePageRecords = Array.from({ length: 20 }, (_, index) =>
  transactionRecord(String(120 - index))
);

export const incompleteWindowPages = Array.from({ length: 5 }, (_, pageIndex) => ({
  _embedded: {
    records: Array.from({ length: 20 }, (_, index) => {
      const sequence = 200n - BigInt(pageIndex * 20 + index);
      return transactionRecord(sequence.toString());
    })
  }
}));

incompleteWindowPages[4]!._embedded.records[19] = transactionRecord("50");

export const truncatedGapRecords = [
  transactionRecord("120"),
  ...Array.from({ length: 19 }, (_, index) => transactionRecord(String(100 - index)))
];
