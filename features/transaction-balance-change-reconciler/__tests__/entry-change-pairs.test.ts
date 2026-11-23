import { describe, expect, it } from "vitest";
import { xdr } from "@stellar/stellar-sdk";
import {
  extractEntryChangePairs,
  pairLedgerEntryChanges
} from "@/features/transaction-balance-change-reconciler/lib/entry-change-pairs";
import {
  accountRemoved,
  unpairedRemoval
} from "@/features/transaction-balance-change-reconciler/fixtures/boundary.fixture";
import {
  destination,
  encodeMeta,
  makeAccountEntry,
  makeTrustlineEntry,
  metaV3Payment,
  normalPayment,
  issuer,
  source,
  trustlineCreated
} from "@/features/transaction-balance-change-reconciler/fixtures/normal.fixture";

describe("pairLedgerEntryChanges", () => {
  it("pairs state and updated for a native balance", () => {
    const before = makeAccountEntry(source, "1000", "1");
    const after = makeAccountEntry(source, "900", "2");
    const { pairs } = pairLedgerEntryChanges(
      [
        xdr.LedgerEntryChange.ledgerEntryState(before),
        xdr.LedgerEntryChange.ledgerEntryUpdated(after)
      ],
      "operation",
      0
    );

    expect(pairs).toHaveLength(1);
    expect(pairs[0]?.beforeBalance).toBe("1000");
    expect(pairs[0]?.afterBalance).toBe("900");
    expect(pairs[0]?.delta).toBe("-100");
    expect(pairs[0]?.asset).toEqual({ kind: "native" });
    expect(pairs[0]?.accountId).toBe(source.publicKey());
  });

  it("treats created trustlines as before=0", () => {
    const created = makeTrustlineEntry(destination, "EUR", issuer, "0");
    const { pairs } = pairLedgerEntryChanges(
      [xdr.LedgerEntryChange.ledgerEntryCreated(created)],
      "operation",
      0
    );

    expect(pairs[0]?.beforeBalance).toBe("0");
    expect(pairs[0]?.afterBalance).toBe("0");
    expect(pairs[0]?.asset).toMatchObject({ kind: "credit", code: "EUR" });
    expect(pairs[0]?.asset && "issuer" in pairs[0].asset && pairs[0].asset.issuer).toBe(
      issuer.publicKey()
    );
  });

  it("marks a removal without state as incomplete", () => {
    const meta = xdr.TransactionMeta.fromXDR(unpairedRemoval.metaXdr, "base64");
    const extracted = extractEntryChangePairs(meta);
    const incomplete = extracted.pairs.filter((pair) => pair.incomplete);
    expect(incomplete.length).toBeGreaterThan(0);
  });

  it("pairs removal with a preceding state", () => {
    const meta = xdr.TransactionMeta.fromXDR(accountRemoved.metaXdr, "base64");
    const extracted = extractEntryChangePairs(meta);
    const removed = extracted.pairs.find(
      (pair) => pair.accountId === destination.publicKey() && pair.asset?.kind === "native"
    );
    expect(removed?.beforeBalance).toBe("25000000");
    expect(removed?.afterBalance).toBe("0");
    expect(removed?.delta).toBe("-25000000");
    expect(removed?.incomplete).toBe(false);
  });

  it("rejects nothing for supported v3 metadata", () => {
    const meta = xdr.TransactionMeta.fromXDR(metaV3Payment.metaXdr, "base64");
    expect(extractEntryChangePairs(meta).variant).toBe("v3");
  });

  it("skips non-balance ledger entries", () => {
    const dataEntry = new xdr.LedgerEntry({
      lastModifiedLedgerSeq: 1,
      data: xdr.LedgerEntryData.data(
        new xdr.DataEntry({
          accountId: makeAccountEntry(source, "1").data().account().accountId(),
          dataName: "x",
          dataValue: Buffer.from("y"),
          ext: new (xdr.DataEntryExt as unknown as new (v: 0) => xdr.DataEntryExt)(0)
        })
      ),
      ext: new (xdr.LedgerEntryExt as unknown as new (v: 0) => xdr.LedgerEntryExt)(0)
    });

    const { pairs, skippedNonBalanceEntries } = pairLedgerEntryChanges(
      [
        xdr.LedgerEntryChange.ledgerEntryState(dataEntry),
        xdr.LedgerEntryChange.ledgerEntryUpdated(dataEntry)
      ],
      "operation",
      0
    );

    expect(pairs.every((pair) => pair.asset === null)).toBe(true);
    expect(skippedNonBalanceEntries).toBeGreaterThan(0);
  });
});

describe("extractEntryChangePairs", () => {
  it("reads fee and operation changes from a normal payment", () => {
    const meta = xdr.TransactionMeta.fromXDR(normalPayment.metaXdr, "base64");
    const extracted = extractEntryChangePairs(meta);
    expect(extracted.variant).toBe("v2");
    expect(extracted.pairs.some((pair) => pair.source === "tx_before")).toBe(true);
    expect(extracted.pairs.some((pair) => pair.source === "operation")).toBe(true);
  });

  it("handles repeated changes culminating in a funded trustline", () => {
    const meta = xdr.TransactionMeta.fromXDR(trustlineCreated.metaXdr, "base64");
    const extracted = extractEntryChangePairs(meta);
    const trust = extracted.pairs.find(
      (pair) => pair.asset?.kind === "credit" && pair.asset.code === "EUR"
    );
    expect(trust?.afterBalance).toBe("25000000");
  });

  it("builds operations-only (v0) metadata", () => {
    const before = makeAccountEntry(source, "100", "1");
    const after = makeAccountEntry(source, "50", "2");
    const metaXdr = encodeMeta(0, {
      operations: [
        new xdr.OperationMeta({
          changes: [
            xdr.LedgerEntryChange.ledgerEntryState(before),
            xdr.LedgerEntryChange.ledgerEntryUpdated(after)
          ]
        })
      ]
    });
    const extracted = extractEntryChangePairs(xdr.TransactionMeta.fromXDR(metaXdr, "base64"));
    expect(extracted.variant).toBe("operations");
    expect(extracted.pairs[0]?.delta).toBe("-50");
  });
});
