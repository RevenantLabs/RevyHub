import { encodeMuxedAccountToAddress, StrKey, xdr } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import { horizonUrl } from "@/core/horizon/client";
import type { StellarNetwork } from "@/core/network/types";
import {
  HorizonStatusError,
  toLedgerFetchErrorCode
} from "@/features/preconditions-explainer/lib/preconditionsExplainer.errors";
import type {
  BoundStatus,
  DecodedPreconditions,
  ExtraSignerExplanation,
  LedgerBoundsExplanation,
  LedgerFetchErrorCode,
  LedgerSnapshot,
  PreconditionsErrorCode,
  PreconditionsExplanation,
  PreconditionsInput,
  TimeBoundsExplanation,
  Verdict
} from "@/features/preconditions-explainer/types";

const LEDGER_REQUEST_TIMEOUT_MS = 12_000;

interface HorizonLedgerRecord {
  sequence?: number;
  closed_at?: string;
}

interface HorizonLedgerPage {
  _embedded?: { records?: HorizonLedgerRecord[] };
}

function encodeExtraSigner(key: xdr.SignerKey): ExtraSignerExplanation {
  switch (key.switch().name) {
    case "signerKeyTypePreAuthTx":
      return { kind: "pre-auth-tx", key: StrKey.encodePreAuthTx(key.preAuthTx()) };
    case "signerKeyTypeHashX":
      return { kind: "hash-x", key: StrKey.encodeSha256Hash(key.hashX()) };
    case "signerKeyTypeEd25519SignedPayload":
      return {
        kind: "ed25519-signed-payload",
        key: StrKey.encodeSignedPayload(key.ed25519SignedPayload().toXDR())
      };
    default:
      return { kind: "ed25519", key: StrKey.encodeEd25519PublicKey(key.ed25519()) };
  }
}

/** A 0/0 window is how the SDK spells "no time bounds", so it is not one. */
function readTimeBounds(bounds: xdr.TimeBounds | null): DecodedPreconditions["timeBounds"] {
  if (!bounds) return null;
  const minTime = bounds.minTime().toString();
  const maxTime = bounds.maxTime().toString();
  return minTime === "0" && maxTime === "0" ? null : { minTime, maxTime };
}

function readLedgerBounds(bounds: xdr.LedgerBounds | null): DecodedPreconditions["ledgerBounds"] {
  if (!bounds) return null;
  const minLedger = bounds.minLedger();
  const maxLedger = bounds.maxLedger();
  return minLedger === 0 && maxLedger === 0 ? null : { minLedger, maxLedger };
}

type Declared = Pick<
  DecodedPreconditions,
  | "timeBounds"
  | "ledgerBounds"
  | "minSequenceNumber"
  | "minSequenceAge"
  | "minSequenceLedgerGap"
  | "extraSigners"
>;

const NO_PRECONDITIONS: Declared = {
  timeBounds: null,
  ledgerBounds: null,
  minSequenceNumber: null,
  minSequenceAge: null,
  minSequenceLedgerGap: null,
  extraSigners: []
};

export function declaresAnyPrecondition(declared: Declared): boolean {
  return Boolean(
    declared.timeBounds ||
      declared.ledgerBounds ||
      declared.minSequenceNumber !== null ||
      declared.minSequenceAge !== null ||
      declared.minSequenceLedgerGap !== null ||
      declared.extraSigners.length
  );
}

function readCond(cond: xdr.Preconditions): Declared {
  switch (cond.switch().name) {
    case "precondTime":
      return { ...NO_PRECONDITIONS, timeBounds: readTimeBounds(cond.timeBounds()) };
    case "precondV2": {
      const v2 = cond.v2();
      const minSeqNum = v2.minSeqNum();
      const minSeqAge = v2.minSeqAge().toString();
      const minSeqLedgerGap = v2.minSeqLedgerGap();

      return {
        timeBounds: readTimeBounds(v2.timeBounds()),
        ledgerBounds: readLedgerBounds(v2.ledgerBounds()),
        minSequenceNumber: minSeqNum ? minSeqNum.toString() : null,
        // Zero is the encoding for "unset", not a rule requiring an age of zero.
        minSequenceAge: minSeqAge === "0" ? null : minSeqAge,
        minSequenceLedgerGap: minSeqLedgerGap === 0 ? null : minSeqLedgerGap,
        extraSigners: v2.extraSigners().map(encodeExtraSigner)
      };
    }
    default:
      return NO_PRECONDITIONS;
  }
}

/**
 * Reads the preconditions an envelope declares, without evaluating them.
 *
 * A fee bump is described by its **inner** transaction: the wrapper only pays
 * the fee, and the preconditions that gate inclusion belong to the transaction
 * that actually executes.
 */
export function readPreconditions(
  { envelope }: PreconditionsInput
): Result<DecodedPreconditions, PreconditionsErrorCode> {
  let decoded: xdr.TransactionEnvelope;

  try {
    decoded = xdr.TransactionEnvelope.fromXDR(envelope, "base64");
  } catch {
    return err("invalid_xdr");
  }

  let result: DecodedPreconditions;

  try {
    switch (decoded.switch().name) {
      case "envelopeTypeTxV0": {
        const tx = decoded.v0().tx();
        result = {
          variant: "classic-v0",
          sourceAccount: StrKey.encodeEd25519PublicKey(tx.sourceAccountEd25519()),
          sequenceNumber: tx.seqNum().toString(),
          ...NO_PRECONDITIONS,
          timeBounds: readTimeBounds(tx.timeBounds())
        };
        break;
      }
      case "envelopeTypeTx": {
        const tx = decoded.v1().tx();
        result = {
          variant: "classic-v1",
          sourceAccount: encodeMuxedAccountToAddress(tx.sourceAccount(), true),
          sequenceNumber: tx.seqNum().toString(),
          ...readCond(tx.cond())
        };
        break;
      }
      case "envelopeTypeTxFeeBump": {
        const innerTx = decoded.feeBump().tx().innerTx();
        if (innerTx.switch().name !== "envelopeTypeTx") return err("invalid_xdr");

        const tx = innerTx.v1().tx();
        result = {
          variant: "fee-bump",
          sourceAccount: encodeMuxedAccountToAddress(tx.sourceAccount(), true),
          sequenceNumber: tx.seqNum().toString(),
          ...readCond(tx.cond())
        };
        break;
      }
      default:
        return err("invalid_xdr");
    }
  } catch {
    // The bytes decoded but a field could not be normalised for display.
    return err("invalid_xdr");
  }

  return declaresAnyPrecondition(result) ? ok(result) : err("no_preconditions");
}

export function normalizeLedgerSnapshot(
  page: HorizonLedgerPage
): Result<LedgerSnapshot, LedgerFetchErrorCode> {
  const record = page?._embedded?.records?.[0];
  if (!record || typeof record.sequence !== "number" || typeof record.closed_at !== "string") {
    return err("ledger_unavailable");
  }

  const closedAtMs = Date.parse(record.closed_at);
  if (!Number.isFinite(closedAtMs)) return err("ledger_unavailable");

  return ok({
    sequence: record.sequence,
    closedAt: record.closed_at,
    closedAtUnix: String(Math.floor(closedAtMs / 1000))
  });
}

/** `GET /ledgers?order=desc&limit=1` — the newest closed ledger and its close time. */
export async function fetchLatestLedger(
  network: StellarNetwork,
  signal?: AbortSignal
): Promise<Result<LedgerSnapshot, LedgerFetchErrorCode>> {
  const controller = new AbortController();
  const abortFromCaller = () => controller.abort();
  if (signal?.aborted) abortFromCaller();
  else signal?.addEventListener("abort", abortFromCaller, { once: true });
  const timeout = setTimeout(() => controller.abort(), LEDGER_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(horizonUrl(network, "/ledgers", { order: "desc", limit: 1 }), {
      signal: controller.signal,
      headers: { Accept: "application/json" }
    });
    if (!response.ok) throw new HorizonStatusError(response.status);
    return normalizeLedgerSnapshot((await response.json()) as HorizonLedgerPage);
  } catch (error) {
    return err(toLedgerFetchErrorCode(error));
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", abortFromCaller);
  }
}

function explainTimeBounds(
  bounds: DecodedPreconditions["timeBounds"],
  referenceSeconds: bigint
): TimeBoundsExplanation | null {
  if (!bounds) return null;

  const min = BigInt(bounds.minTime);
  const max = BigInt(bounds.maxTime);

  // stellar-core treats minTime as inclusive and rejects only when
  // maxTime < closeTime, so an exact match at either end is still valid.
  const status: BoundStatus =
    max !== 0n && max < referenceSeconds
      ? "expired"
      : min !== 0n && min > referenceSeconds
        ? "not_yet"
        : "satisfied";

  return {
    minTime: bounds.minTime,
    maxTime: bounds.maxTime,
    minTimeIso: min === 0n ? null : toIsoSeconds(min),
    maxTimeIso: max === 0n ? null : toIsoSeconds(max),
    minTimeDeltaSeconds: min === 0n ? null : (min - referenceSeconds).toString(),
    maxTimeDeltaSeconds: max === 0n ? null : (max - referenceSeconds).toString(),
    status
  };
}

/** Unix seconds beyond this cannot be represented by `Date`. */
const MAX_REPRESENTABLE_SECONDS = 8_640_000_000_000n;

export function toIsoSeconds(seconds: bigint): string | null {
  if (seconds < 0n || seconds > MAX_REPRESENTABLE_SECONDS) return null;
  return new Date(Number(seconds) * 1000).toISOString();
}

function explainLedgerBounds(
  bounds: DecodedPreconditions["ledgerBounds"],
  ledger: LedgerSnapshot | null
): LedgerBoundsExplanation | null {
  if (!bounds) return null;

  if (!ledger) {
    return { ...bounds, status: "unknown", ledgersUntilMin: null, ledgersUntilMax: null };
  }

  const current = ledger.sequence;
  // maxLedger is exclusive: the transaction is already invalid on that ledger.
  const status: BoundStatus =
    bounds.maxLedger !== 0 && current >= bounds.maxLedger
      ? "expired"
      : current < bounds.minLedger
        ? "not_yet"
        : "satisfied";

  return {
    ...bounds,
    status,
    ledgersUntilMin: bounds.minLedger === 0 ? null : bounds.minLedger - current,
    ledgersUntilMax: bounds.maxLedger === 0 ? null : bounds.maxLedger - current
  };
}

export function verdictOf(statuses: readonly BoundStatus[]): Verdict {
  if (statuses.includes("expired")) return "expired";
  if (statuses.includes("not_yet")) return "not_yet";
  if (statuses.includes("unknown")) return "unknown";
  return "satisfiable";
}

export interface EvaluationContext {
  ledger: LedgerSnapshot | null;
  degradedReason: LedgerFetchErrorCode | null;
  /** Milliseconds since the epoch, used when no ledger close time is available. */
  now: number;
}

/**
 * Turns decoded preconditions into an evaluated explanation.
 *
 * Pure on purpose: the snapshot is passed in rather than fetched, so every
 * verdict is reproducible in a test without a clock or a network.
 */
export function evaluatePreconditions(
  decoded: DecodedPreconditions,
  { ledger, degradedReason, now }: EvaluationContext
): PreconditionsExplanation {
  const referenceSeconds = ledger
    ? BigInt(ledger.closedAtUnix)
    : BigInt(Math.floor(now / 1000));

  const timeBounds = explainTimeBounds(decoded.timeBounds, referenceSeconds);
  const ledgerBounds = explainLedgerBounds(decoded.ledgerBounds, ledger);

  const statuses = [timeBounds?.status, ledgerBounds?.status].filter(
    (status): status is BoundStatus => status !== undefined
  );

  return {
    variant: decoded.variant,
    sourceAccount: decoded.sourceAccount,
    sequenceNumber: decoded.sequenceNumber,
    timeBounds,
    ledgerBounds,
    minSequenceNumber: decoded.minSequenceNumber,
    minSequenceAge: decoded.minSequenceAge,
    minSequenceLedgerGap: decoded.minSequenceLedgerGap,
    extraSigners: decoded.extraSigners,
    accountDependent:
      decoded.minSequenceNumber !== null ||
      decoded.minSequenceAge !== null ||
      decoded.minSequenceLedgerGap !== null,
    verdict: verdictOf(statuses),
    ledger,
    degradedReason,
    clockSource: ledger ? "ledger-close-time" : "local-clock",
    evaluatedAt: new Date(now).toISOString()
  };
}

/**
 * Decodes an envelope, takes a ledger snapshot and evaluates the two together.
 *
 * A failed snapshot is deliberately **not** an error: the bounds decoded from
 * the envelope are still the most useful thing on screen, so the failure is
 * carried on the successful result as `degradedReason` instead of replacing it.
 */
export async function explainPreconditions(
  input: PreconditionsInput,
  network: StellarNetwork,
  signal?: AbortSignal
): Promise<Result<PreconditionsExplanation, PreconditionsErrorCode>> {
  const decoded = readPreconditions(input);
  if (!decoded.ok) return decoded;

  const snapshot = await fetchLatestLedger(network, signal);

  return ok(
    evaluatePreconditions(decoded.value, {
      ledger: snapshot.ok ? snapshot.value : null,
      degradedReason: snapshot.ok ? null : snapshot.code,
      now: Date.now()
    })
  );
}
