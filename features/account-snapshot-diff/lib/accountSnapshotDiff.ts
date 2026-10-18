import { StrKey } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type {
  ChangeType,
  SnapshotChange,
  SnapshotDiff,
  SnapshotErrorCode,
  SnapshotInput,
  SnapshotSection
} from "@/features/account-snapshot-diff/types";

const STROOPS_PER_UNIT = 10_000_000n;

/** Fields whose values are Stellar amounts and therefore get an exact delta. */
const AMOUNT_FIELDS = new Set([
  "balance",
  "buying_liabilities",
  "selling_liabilities",
  "limit"
]);

/** Top-level fields this tool compares, grouped by the section they belong to. */
const ACCOUNT_FIELDS = [
  "sequence",
  "sequence_ledger",
  "sequence_time",
  "subentry_count",
  "last_modified_ledger",
  "last_modified_time",
  "num_sponsoring",
  "num_sponsored",
  "sponsor",
  "home_domain",
  "inflation_destination"
] as const;

const THRESHOLD_FIELDS = ["low_threshold", "med_threshold", "high_threshold"] as const;

const FLAG_FIELDS = [
  "auth_required",
  "auth_revocable",
  "auth_immutable",
  "auth_clawback_enabled"
] as const;

/** Horizon envelope noise that is not part of the account's state. */
const IGNORED_FIELDS = new Set(["_links", "id", "paging_token", "account_id"]);

const STRUCTURED_FIELDS = new Set(["thresholds", "flags", "balances", "signers", "data"]);

type Json = Record<string, unknown>;

/** A flat map of `section|key|field` to its string value. */
type FlatMap = Map<string, { section: SnapshotSection; key: string; field: string; value: string }>;

/**
 * Converts a Stellar amount to stroops without going through `Number`.
 *
 * Balances have 7 decimal places and can exceed the safe integer range, so a
 * float subtraction would silently lose the smallest movements — exactly the
 * ones worth investigating.
 */
export function toStroops(amount: string): bigint {
  const negative = amount.startsWith("-");
  const unsigned = negative ? amount.slice(1) : amount;
  const [whole, fraction = ""] = unsigned.split(".");
  const stroops =
    BigInt(whole || "0") * STROOPS_PER_UNIT + BigInt(fraction.padEnd(7, "0").slice(0, 7));

  return negative ? -stroops : stroops;
}

export function fromStroops(stroops: bigint): string {
  const negative = stroops < 0n;
  const absolute = negative ? -stroops : stroops;
  const whole = absolute / STROOPS_PER_UNIT;
  const fraction = (absolute % STROOPS_PER_UNIT).toString().padStart(7, "0");

  return `${negative ? "-" : ""}${whole}.${fraction}`;
}

const AMOUNT_SHAPE = /^-?\d+(\.\d+)?$/;

/** Signed difference between two amounts, or `null` when either is not one. */
export function amountDelta(before: string | null, after: string | null): string | null {
  if (before === null || after === null) return null;
  if (!AMOUNT_SHAPE.test(before) || !AMOUNT_SHAPE.test(after)) return null;

  return fromStroops(toStroops(after) - toStroops(before));
}

/**
 * The identity a balance is matched by.
 *
 * Full asset identity, never the code alone: two different issuers can and do
 * use the same four letters, and matching on the code would silently compare
 * one asset's balance against a completely different asset's.
 */
export function balanceKey(balance: Json): string {
  const type = String(balance.asset_type ?? "");
  if (type === "native") return "native";
  if (type === "liquidity_pool_shares") return `pool:${String(balance.liquidity_pool_id ?? "")}`;
  return `${String(balance.asset_code ?? "")}:${String(balance.asset_issuer ?? "")}`;
}

function put(
  map: FlatMap,
  section: SnapshotSection,
  key: string,
  field: string,
  value: unknown
): void {
  if (value === null || value === undefined) return;
  if (typeof value === "object") return;
  map.set(`${section}|${key}|${field}`, { section, key, field, value: String(value) });
}

function isJson(value: unknown): value is Json {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Flattens a snapshot into keyed fields.
 *
 * Arrays are keyed by identity — asset, pool ID, signer key — rather than by
 * position, so reordering a snapshot's `balances` array produces no change at
 * all. Horizon makes no ordering guarantee, and a reordering reported as a
 * movement would be a false alarm every time.
 */
export function flattenSnapshot(snapshot: Json): FlatMap {
  const map: FlatMap = new Map();

  for (const field of ACCOUNT_FIELDS) put(map, "account", "account", field, snapshot[field]);

  const thresholds = isJson(snapshot.thresholds) ? snapshot.thresholds : {};
  for (const field of THRESHOLD_FIELDS) {
    put(map, "thresholds", "thresholds", field, thresholds[field]);
  }

  const flags = isJson(snapshot.flags) ? snapshot.flags : {};
  for (const field of FLAG_FIELDS) put(map, "flags", "flags", field, flags[field]);

  if (Array.isArray(snapshot.balances)) {
    for (const entry of snapshot.balances) {
      if (!isJson(entry)) continue;
      const key = balanceKey(entry);
      for (const [field, value] of Object.entries(entry)) put(map, "balances", key, field, value);
    }
  }

  if (Array.isArray(snapshot.signers)) {
    for (const entry of snapshot.signers) {
      if (!isJson(entry)) continue;
      const key = String(entry.key ?? "");
      for (const [field, value] of Object.entries(entry)) put(map, "signers", key, field, value);
    }
  }

  if (isJson(snapshot.data)) {
    for (const [name, value] of Object.entries(snapshot.data)) {
      put(map, "data", name, "value", value);
    }
  }

  return map;
}

/** Top-level fields present in a snapshot that this tool does not compare. */
export function unsupportedFieldsIn(snapshot: Json): string[] {
  const known = new Set<string>([...ACCOUNT_FIELDS, ...STRUCTURED_FIELDS, ...IGNORED_FIELDS]);
  return Object.keys(snapshot).filter((field) => !known.has(field));
}

function parseSnapshot(raw: string): Json | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isJson(parsed)) return null;

    const accountId = parsed.account_id;
    // A Horizon account resource always carries a valid public account ID.
    // Anything else is some other JSON document.
    if (typeof accountId !== "string" || !StrKey.isValidEd25519PublicKey(accountId)) return null;

    return parsed;
  } catch {
    return null;
  }
}

function classify(before: string | null, after: string | null): ChangeType {
  if (before !== null && after === null) return "removed";
  if (before === null && after !== null) return "added";
  return before === after ? "unchanged" : "changed";
}

export function diffFlatMaps(before: FlatMap, after: FlatMap): SnapshotChange[] {
  const keys = [...new Set([...before.keys(), ...after.keys()])].sort();

  return keys.map((mapKey) => {
    const left = before.get(mapKey) ?? null;
    const right = after.get(mapKey) ?? null;
    const known = (left ?? right)!;

    const beforeValue = left?.value ?? null;
    const afterValue = right?.value ?? null;

    return {
      section: known.section,
      key: known.key,
      field: known.field,
      before: beforeValue,
      after: afterValue,
      delta: AMOUNT_FIELDS.has(known.field) ? amountDelta(beforeValue, afterValue) : null,
      type: classify(beforeValue, afterValue)
    };
  });
}

/**
 * Compares two account snapshots.
 *
 * The two documents are observations, nothing more. This tool does not infer
 * what happened between them, does not order them by time — the labels are
 * "before" and "after" because the user said so, not because any timestamp was
 * read — and never contacts Horizon.
 */
export function diffSnapshots({
  before: rawBefore,
  after: rawAfter
}: SnapshotInput): Result<SnapshotDiff, SnapshotErrorCode> {
  const before = parseSnapshot(rawBefore);
  if (!before) return err("invalid_snapshot");

  const after = parseSnapshot(rawAfter);
  if (!after) return err("invalid_snapshot");

  if (before.account_id !== after.account_id) return err("account_mismatch");

  const changes = diffFlatMaps(flattenSnapshot(before), flattenSnapshot(after));
  const changedCount = changes.filter((change) => change.type !== "unchanged").length;

  return ok({
    accountId: String(before.account_id),
    changes,
    changedCount,
    unchangedCount: changes.length - changedCount,
    identical: changedCount === 0,
    unsupportedFields: [
      ...new Set([...unsupportedFieldsIn(before), ...unsupportedFieldsIn(after)])
    ].sort()
  });
}

/**
 * A deterministic JSON summary.
 *
 * Changes are already in a stable sorted order and no timestamp is included,
 * so the same pair of snapshots always produces byte-identical output. The
 * snapshots themselves are not copied into it — nothing is stored.
 */
export function toJsonSummary(diff: SnapshotDiff): string {
  return JSON.stringify(
    {
      accountId: diff.accountId,
      identical: diff.identical,
      changedCount: diff.changedCount,
      unchangedCount: diff.unchangedCount,
      unsupportedFields: diff.unsupportedFields,
      changes: diff.changes
        .filter((change) => change.type !== "unchanged")
        .map((change) => ({
          section: change.section,
          key: change.key,
          field: change.field,
          type: change.type,
          before: change.before,
          after: change.after,
          delta: change.delta
        }))
    },
    null,
    2
  );
}
