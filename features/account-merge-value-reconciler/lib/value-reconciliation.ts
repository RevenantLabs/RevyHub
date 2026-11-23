import { StrKey, xdr } from "@stellar/stellar-sdk";
import type { EvidenceGap, MergeTransfer, UnrelatedChange } from "../types";
import { baseAccount } from "./merge-result-map";

function accountSnapshot(entry: xdr.LedgerEntry): { address: string; balance: bigint } | null {
  const data = entry.data();
  if (data.switch().name !== "account") return null;
  const account = data.account();
  return { address: StrKey.encodeEd25519PublicKey(account.accountId().ed25519()), balance: BigInt(account.balance().toString()) };
}

export interface ObservedAccountChanges {
  /** Native balance delta for every account with a paired before/after (or removal) snapshot. */
  deltas: Map<string, bigint>;
  removed: Set<string>;
  /** An account was updated, created or removed without the snapshot needed for an exact delta. */
  incomplete: boolean;
}

/** Only paired pre/post account snapshots can produce an exact balance delta. */
export function accountChanges(changes: xdr.LedgerEntryChange[]): ObservedAccountChanges {
  const before = new Map<string, bigint>();
  const after = new Map<string, bigint>();
  const created = new Set<string>();
  const removed = new Set<string>();
  for (const change of changes) {
    const kind = change.switch().name;
    if (kind === "ledgerEntryRemoved") {
      const key = change.removed();
      if (key.switch().name === "account") removed.add(StrKey.encodeEd25519PublicKey(key.account().accountId().ed25519()));
      continue;
    }
    const entry = kind === "ledgerEntryState" ? change.state()
      : kind === "ledgerEntryUpdated" ? change.updated()
      : kind === "ledgerEntryCreated" ? change.created()
      : null;
    if (!entry) continue;
    const snapshot = accountSnapshot(entry);
    if (!snapshot) continue;
    if (kind === "ledgerEntryState") before.set(snapshot.address, snapshot.balance);
    else {
      if (kind === "ledgerEntryCreated") created.add(snapshot.address);
      after.set(snapshot.address, snapshot.balance);
    }
  }
  let incomplete = false;
  const deltas = new Map<string, bigint>();
  for (const [address, balance] of after) {
    if (before.has(address)) deltas.set(address, balance - before.get(address)!);
    else if (created.has(address)) deltas.set(address, balance);
    else incomplete = true;
  }
  for (const address of removed) {
    if (before.has(address)) deltas.set(address, -before.get(address)!);
    else incomplete = true;
  }
  return { deltas, removed, incomplete };
}

export function metadataOperations(meta: xdr.TransactionMeta): { version: number; operations: xdr.OperationMeta[] } | null {
  const version = meta.switch();
  switch (version) {
    case 0: return { version, operations: meta.operations() };
    case 1: return { version, operations: meta.v1().operations() };
    case 2: return { version, operations: meta.v2().operations() };
    case 3: return { version, operations: meta.v3().operations() };
    default: return null;
  }
}

function transactionChanges(meta: xdr.TransactionMeta): xdr.LedgerEntryChange[][] {
  switch (meta.switch()) {
    case 1: return [meta.v1().txChanges()];
    case 2: return [meta.v2().txChangesBefore(), meta.v2().txChangesAfter()];
    case 3: return [meta.v3().txChangesBefore(), meta.v3().txChangesAfter()];
    default: return [];
  }
}

export interface ValueReconciliation {
  gaps: EvidenceGap[];
  unrelatedBalanceChangesStroops: string | null;
  unrelatedChanges: UnrelatedChange[];
  metadataVersion: number;
}

/**
 * Checks each successful merge against its own operation metadata: the merge
 * source must be removed and the destination's native delta must equal the
 * result transfer. Every other observed native delta is summed separately as
 * unrelated, except transaction-level changes to the fee payer, which are
 * fee-related (for example a refund) and never attributed to merges or to
 * unrelated activity. Fee charging itself is outside TransactionMeta.
 */
export function reconcileValue(
  transfers: MergeTransfer[],
  operationCount: number,
  meta: xdr.TransactionMeta | null,
  transactionFailed: boolean,
  feePayer: string
): ValueReconciliation {
  const gaps: EvidenceGap[] = [];
  if (!transfers.length) gaps.push({ index: null, code: "no_merge" });
  if (transactionFailed) gaps.push({ index: null, code: "transaction_failed" });
  for (const transfer of transfers) {
    if (transfer.status === "unavailable" && !transactionFailed) gaps.push({ index: transfer.index, code: "missing_result" });
  }
  if (!meta) {
    gaps.push({ index: null, code: "missing_metadata" });
    return { gaps, unrelatedBalanceChangesStroops: null, unrelatedChanges: [], metadataVersion: -1 };
  }
  const decoded = metadataOperations(meta);
  if (!decoded) {
    gaps.push({ index: null, code: "missing_metadata" });
    return { gaps, unrelatedBalanceChangesStroops: null, unrelatedChanges: [], metadataVersion: meta.switch() };
  }
  // A failed transaction records no operation metadata; nothing was applied, so
  // there is no merge to verify and no unrelated operation total to assert.
  if (transactionFailed) return { gaps, unrelatedBalanceChangesStroops: null, unrelatedChanges: [], metadataVersion: decoded.version };
  if (decoded.operations.length !== operationCount) {
    gaps.push({ index: null, code: "missing_metadata" });
    return { gaps, unrelatedBalanceChangesStroops: null, unrelatedChanges: [], metadataVersion: decoded.version };
  }

  const payer = baseAccount(feePayer);
  let unrelated = 0n;
  let exact = true;
  const unrelatedChanges: UnrelatedChange[] = [];
  const record = (index: number | null, account: string, delta: bigint) => {
    unrelated += delta;
    if (delta !== 0n) unrelatedChanges.push({ index, account, stroops: delta.toString() });
  };
  for (const changes of transactionChanges(meta)) {
    const observed = accountChanges(changes);
    if (observed.incomplete) {
      gaps.push({ index: null, code: "missing_metadata" });
      exact = false;
    }
    for (const [address, delta] of observed.deltas) {
      if (address !== payer) record(null, address, delta);
      else if (delta !== 0n) gaps.push({ index: null, code: "fee_payer_change" });
    }
  }
  for (let index = 0; index < operationCount; index++) {
    const observed = accountChanges(decoded.operations[index].changes());
    const transfer = transfers.find((item) => item.index === index && item.status === "success");
    if (observed.incomplete) {
      gaps.push({ index, code: "missing_metadata" });
      exact = false;
    }
    if (transfer) {
      const destinationDelta = observed.deltas.get(transfer.destinationAccount);
      if (!observed.removed.has(transfer.sourceAccount) || destinationDelta === undefined) {
        gaps.push({ index, code: "missing_metadata" });
        exact = false;
      } else if (destinationDelta !== BigInt(transfer.stroops!)) {
        gaps.push({ index, code: "contradictory_metadata" });
        exact = false;
      } else if (observed.deltas.get(transfer.sourceAccount) !== -destinationDelta) {
        gaps.push({ index, code: "contradictory_metadata" });
        exact = false;
      }
    }
    for (const [address, delta] of observed.deltas) {
      if (transfer && (address === transfer.sourceAccount || address === transfer.destinationAccount)) continue;
      record(index, address, delta);
    }
  }
  return { gaps, unrelatedBalanceChangesStroops: exact ? unrelated.toString() : null, unrelatedChanges, metadataVersion: decoded.version };
}
