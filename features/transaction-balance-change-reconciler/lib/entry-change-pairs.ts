import { StrKey, xdr } from "@stellar/stellar-sdk";
import type {
  AssetRef,
  ChangeKind,
  ChangeSource,
  EntryChangePair,
  MetaVariant
} from "@/features/transaction-balance-change-reconciler/types";

export interface ExtractedChanges {
  variant: MetaVariant;
  pairs: EntryChangePair[];
  skippedNonBalanceEntries: number;
}

interface MutablePair {
  ledgerKey: string;
  accountId: string | null;
  asset: AssetRef | null;
  beforeBalance: string | null;
  afterBalance: string | null;
  changeKinds: ChangeKind[];
  source: ChangeSource;
  operationIndex: number | null;
  sawBalance: boolean;
}

function accountIdFromPublicKey(publicKey: xdr.PublicKey): string | null {
  try {
    if (publicKey.switch().name !== "publicKeyTypeEd25519") return null;
    return StrKey.encodeEd25519PublicKey(publicKey.ed25519());
  } catch {
    return null;
  }
}

function assetFromTrustLineAsset(asset: xdr.TrustLineAsset): AssetRef | null {
  switch (asset.switch().name) {
    case "assetTypeCreditAlphanum4": {
      const alpha = asset.alphaNum4();
      const code = alpha.assetCode().toString("utf8").replace(/\0+$/, "");
      const issuer = accountIdFromPublicKey(alpha.issuer());
      if (!issuer) return null;
      return { kind: "credit", code, issuer };
    }
    case "assetTypeCreditAlphanum12": {
      const alpha = asset.alphaNum12();
      const code = alpha.assetCode().toString("utf8").replace(/\0+$/, "");
      const issuer = accountIdFromPublicKey(alpha.issuer());
      if (!issuer) return null;
      return { kind: "credit", code, issuer };
    }
    default:
      // Liquidity-pool share lines are not issued assets with an issuer identity.
      return null;
  }
}

function balanceFromEntry(entry: xdr.LedgerEntry): {
  accountId: string | null;
  asset: AssetRef | null;
  balance: string | null;
  isBalance: boolean;
} {
  const data = entry.data();
  switch (data.switch().name) {
    case "account": {
      const account = data.account();
      return {
        accountId: accountIdFromPublicKey(account.accountId()),
        asset: { kind: "native" },
        balance: account.balance().toString(),
        isBalance: true
      };
    }
    case "trustline": {
      const trust = data.trustLine();
      const asset = assetFromTrustLineAsset(trust.asset());
      return {
        accountId: accountIdFromPublicKey(trust.accountId()),
        asset,
        balance: trust.balance().toString(),
        isBalance: asset !== null
      };
    }
    default:
      return { accountId: null, asset: null, balance: null, isBalance: false };
  }
}

function ledgerKeyFromEntry(entry: xdr.LedgerEntry): xdr.LedgerKey | null {
  const data = entry.data();
  switch (data.switch().name) {
    case "account":
      return xdr.LedgerKey.account(
        new xdr.LedgerKeyAccount({ accountId: data.account().accountId() })
      );
    case "trustline":
      return xdr.LedgerKey.trustline(
        new xdr.LedgerKeyTrustLine({
          accountId: data.trustLine().accountId(),
          asset: data.trustLine().asset()
        })
      );
    case "offer":
      return xdr.LedgerKey.offer(
        new xdr.LedgerKeyOffer({
          sellerId: data.offer().sellerId(),
          offerId: data.offer().offerId()
        })
      );
    case "data":
      return xdr.LedgerKey.data(
        new xdr.LedgerKeyData({
          accountId: data.data().accountId(),
          dataName: data.data().dataName()
        })
      );
    case "claimableBalance":
      return xdr.LedgerKey.claimableBalance(
        new xdr.LedgerKeyClaimableBalance({
          balanceId: data.claimableBalance().balanceId()
        })
      );
    case "liquidityPool":
      return xdr.LedgerKey.liquidityPool(
        new xdr.LedgerKeyLiquidityPool({
          liquidityPoolId: data.liquidityPool().liquidityPoolId()
        })
      );
    default:
      return null;
  }
}

function canonicalKey(key: xdr.LedgerKey): string {
  return key.toXDR("base64");
}

function identityFromLedgerKey(key: xdr.LedgerKey): {
  accountId: string | null;
  asset: AssetRef | null;
  isBalance: boolean;
} {
  switch (key.switch().name) {
    case "account":
      return {
        accountId: accountIdFromPublicKey(key.account().accountId()),
        asset: { kind: "native" },
        isBalance: true
      };
    case "trustline": {
      const trust = key.trustLine();
      const asset = assetFromTrustLineAsset(trust.asset());
      return {
        accountId: accountIdFromPublicKey(trust.accountId()),
        asset,
        isBalance: asset !== null
      };
    }
    default:
      return { accountId: null, asset: null, isBalance: false };
  }
}

function kindName(change: xdr.LedgerEntryChange): ChangeKind {
  switch (change.switch().name) {
    case "ledgerEntryCreated":
      return "created";
    case "ledgerEntryUpdated":
      return "updated";
    case "ledgerEntryRemoved":
      return "removed";
    default:
      return "state";
  }
}

function pairKey(ledgerKey: string, source: ChangeSource, operationIndex: number | null): string {
  return `${source}:${operationIndex ?? "-"}:${ledgerKey}`;
}

function finalize(pair: MutablePair): EntryChangePair {
  let delta: string | null = null;
  if (pair.beforeBalance !== null && pair.afterBalance !== null) {
    delta = (BigInt(pair.afterBalance) - BigInt(pair.beforeBalance)).toString();
  } else if (pair.changeKinds.includes("created") && pair.afterBalance !== null) {
    delta = pair.afterBalance;
    pair.beforeBalance = "0";
  } else if (pair.changeKinds.includes("removed") && pair.beforeBalance !== null) {
    delta = (-BigInt(pair.beforeBalance)).toString();
    pair.afterBalance = "0";
  }

  // A removal (or any balance-bearing touch) without both sides is incomplete
  // evidence — including a bare `removed` key that never carried a balance.
  const incomplete =
    delta === null &&
    (pair.sawBalance ||
      pair.changeKinds.includes("removed") ||
      pair.changeKinds.includes("created") ||
      pair.changeKinds.includes("updated"));

  return {
    ledgerKey: pair.ledgerKey,
    accountId: pair.accountId,
    asset: pair.asset,
    beforeBalance: pair.beforeBalance,
    afterBalance: pair.afterBalance,
    delta,
    changeKinds: pair.changeKinds,
    source: pair.source,
    operationIndex: pair.operationIndex,
    incomplete
  };
}

/**
 * Walks one change list and pairs before/after sides by canonical ledger key.
 *
 * Repeated touches to the same key inside one list keep the earliest before
 * balance and the latest after balance so the net effect of the list stays
 * exact. Creation implies before=0; removal implies after=0 when a prior state
 * supplied the before balance.
 */
export function pairLedgerEntryChanges(
  changes: readonly xdr.LedgerEntryChange[],
  source: ChangeSource,
  operationIndex: number | null
): { pairs: EntryChangePair[]; skippedNonBalanceEntries: number } {
  const byKey = new Map<string, MutablePair>();
  let skippedNonBalanceEntries = 0;

  for (const change of changes) {
    const kind = kindName(change);
    let keyXdr: string;
    let accountId: string | null = null;
    let asset: AssetRef | null = null;
    let balance: string | null = null;
    let isBalance = false;

    if (kind === "removed") {
      const removed = change.removed();
      keyXdr = canonicalKey(removed);
      const identity = identityFromLedgerKey(removed);
      accountId = identity.accountId;
      asset = identity.asset;
      isBalance = identity.isBalance;
      if (!isBalance) skippedNonBalanceEntries += 1;
    } else {
      const entry =
        kind === "created" ? change.created() : kind === "updated" ? change.updated() : change.state();
      const derivedKey = ledgerKeyFromEntry(entry);
      if (!derivedKey) {
        skippedNonBalanceEntries += 1;
        continue;
      }
      keyXdr = canonicalKey(derivedKey);
      const parsed = balanceFromEntry(entry);
      accountId = parsed.accountId;
      asset = parsed.asset;
      balance = parsed.balance;
      isBalance = parsed.isBalance;
      if (!isBalance) skippedNonBalanceEntries += 1;
    }

    const mapKey = pairKey(keyXdr, source, operationIndex);
    let pair = byKey.get(mapKey);
    if (!pair) {
      pair = {
        ledgerKey: keyXdr,
        accountId,
        asset,
        beforeBalance: null,
        afterBalance: null,
        changeKinds: [],
        source,
        operationIndex,
        sawBalance: false
      };
      byKey.set(mapKey, pair);
    }

    if (!pair.changeKinds.includes(kind)) pair.changeKinds.push(kind);
    if (accountId && !pair.accountId) pair.accountId = accountId;
    if (asset && !pair.asset) pair.asset = asset;
    if (isBalance) pair.sawBalance = true;

    if (kind === "state" && balance !== null && pair.beforeBalance === null) {
      pair.beforeBalance = balance;
    }

    if (kind === "created" || kind === "updated") {
      if (balance !== null) pair.afterBalance = balance;
      if (kind === "created" && pair.beforeBalance === null) pair.beforeBalance = "0";
    }

    if (kind === "removed") {
      // Removal without a preceding state leaves before unknown — incomplete.
      pair.afterBalance = "0";
    }
  }

  return {
    pairs: [...byKey.values()].map(finalize),
    skippedNonBalanceEntries
  };
}

function collectFromOperations(
  operations: readonly xdr.OperationMeta[]
): { pairs: EntryChangePair[]; skippedNonBalanceEntries: number } {
  const pairs: EntryChangePair[] = [];
  let skippedNonBalanceEntries = 0;

  operations.forEach((operation, index) => {
    const extracted = pairLedgerEntryChanges(operation.changes(), "operation", index);
    pairs.push(...extracted.pairs);
    skippedNonBalanceEntries += extracted.skippedNonBalanceEntries;
  });

  return { pairs, skippedNonBalanceEntries };
}

/**
 * Reads every ledger-entry change the installed SDK exposes for a metadata
 * variant and returns paired before/after balance observations.
 *
 * `TransactionMeta` is switched on an Int, so the arm name comes from
 * `meta.arm()` — `meta.switch().name` is undefined for integer discriminants.
 */
export function extractEntryChangePairs(meta: xdr.TransactionMeta): ExtractedChanges {
  const arm = meta.arm() as string;

  if (arm === "operations") {
    const collected = collectFromOperations(meta.operations());
    return { variant: "operations", ...collected };
  }

  if (arm === "v1") {
    const body = meta.v1();
    const before = pairLedgerEntryChanges(body.txChanges(), "tx_before", null);
    const ops = collectFromOperations(body.operations());
    return {
      variant: "v1",
      pairs: [...before.pairs, ...ops.pairs],
      skippedNonBalanceEntries: before.skippedNonBalanceEntries + ops.skippedNonBalanceEntries
    };
  }

  if (arm === "v2") {
    const body = meta.v2();
    const before = pairLedgerEntryChanges(body.txChangesBefore(), "tx_before", null);
    const ops = collectFromOperations(body.operations());
    const after = pairLedgerEntryChanges(body.txChangesAfter(), "tx_after", null);
    return {
      variant: "v2",
      pairs: [...before.pairs, ...ops.pairs, ...after.pairs],
      skippedNonBalanceEntries:
        before.skippedNonBalanceEntries +
        ops.skippedNonBalanceEntries +
        after.skippedNonBalanceEntries
    };
  }

  if (arm === "v3") {
    const body = meta.v3();
    const before = pairLedgerEntryChanges(body.txChangesBefore(), "tx_before", null);
    const ops = collectFromOperations(body.operations());
    const after = pairLedgerEntryChanges(body.txChangesAfter(), "tx_after", null);
    return {
      variant: "v3",
      pairs: [...before.pairs, ...ops.pairs, ...after.pairs],
      skippedNonBalanceEntries:
        before.skippedNonBalanceEntries +
        ops.skippedNonBalanceEntries +
        after.skippedNonBalanceEntries
    };
  }

  throw new Error(`unsupported meta variant: ${arm}`);
}

export function metaVariantName(meta: xdr.TransactionMeta): MetaVariant | null {
  const arm = meta.arm();
  if (arm === "operations" || arm === "v1" || arm === "v2" || arm === "v3") return arm;
  return null;
}
