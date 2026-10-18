import { describe, expect, it } from "vitest";
import { withMswHandlers } from "@/core/testing/msw";
import {
  evaluatePreconditions,
  explainPreconditions,
  fetchLatestLedger,
  normalizeLedgerSnapshot,
  readPreconditions,
  verdictOf
} from "@/features/preconditions-explainer/lib/preconditionsExplainer";
import {
  isEnvelopeProblem,
  toLedgerFetchErrorCode
} from "@/features/preconditions-explainer/lib/preconditionsExplainer.errors";
import {
  currentLedgerClosedAtUnix,
  currentLedgerSequence,
  expiredXdr,
  extraSigner,
  feeBumpXdr,
  ledgerBoundsOnlyXdr,
  ledgerSnapshot,
  minAccountSequence,
  minAccountSequenceAge,
  minAccountSequenceLedgerGap,
  notAnEnvelopeXdr,
  notYetValidXdr,
  openMaxLedger,
  openMaxTime,
  openMinLedger,
  openMinTime,
  openXdr,
  source,
  unconditionalXdr
} from "@/features/preconditions-explainer/fixtures/preconditionsExplainer.fixture";
import {
  emptyLedgerPageHandler,
  handlers,
  ledgerNotFoundHandler,
  serverErrorHandler,
  transportFailureHandler
} from "@/features/preconditions-explainer/msw/handlers";

const server = withMswHandlers(...handlers);

const NOW_MS = Date.parse("2026-05-02T10:15:00.000Z");

function decode(xdrValue: string) {
  const result = readPreconditions({ envelope: xdrValue });
  if (!result.ok) throw new Error(`expected a decode, got ${result.code}`);
  return result.value;
}

describe("readPreconditions", () => {
  it("reads every declared precondition off a v1 envelope", () => {
    const decoded = decode(openXdr);

    expect(decoded.variant).toBe("classic-v1");
    expect(decoded.sourceAccount).toBe(source.publicKey());
    expect(decoded.timeBounds).toEqual({
      minTime: String(openMinTime),
      maxTime: String(openMaxTime)
    });
    expect(decoded.ledgerBounds).toEqual({
      minLedger: openMinLedger,
      maxLedger: openMaxLedger
    });
    expect(decoded.minSequenceNumber).toBe(minAccountSequence);
    expect(decoded.minSequenceAge).toBe(String(minAccountSequenceAge));
    expect(decoded.minSequenceLedgerGap).toBe(minAccountSequenceLedgerGap);
    expect(decoded.extraSigners).toEqual([
      { kind: "ed25519", key: extraSigner.publicKey() }
    ]);
  });

  it("describes a fee bump by its inner transaction", () => {
    const decoded = decode(feeBumpXdr);

    expect(decoded.variant).toBe("fee-bump");
    expect(decoded.sourceAccount).toBe(source.publicKey());
    expect(decoded.timeBounds).toEqual({
      minTime: String(openMinTime),
      maxTime: String(openMaxTime)
    });
  });

  it("returns no_preconditions when the transaction declares none", () => {
    expect(readPreconditions({ envelope: unconditionalXdr })).toEqual({
      ok: false,
      code: "no_preconditions"
    });
  });

  it("returns invalid_xdr for base64 that is not an envelope", () => {
    expect(readPreconditions({ envelope: notAnEnvelopeXdr })).toEqual({
      ok: false,
      code: "invalid_xdr"
    });
  });

  it("never throws for a caller-supplied failure", () => {
    expect(() => readPreconditions({ envelope: "AAAA" })).not.toThrow();
    expect(readPreconditions({ envelope: "AAAA" }).ok).toBe(false);
  });
});

describe("evaluatePreconditions", () => {
  const context = { ledger: ledgerSnapshot, degradedReason: null, now: NOW_MS };

  it("calls an open window satisfiable and reports both distances", () => {
    const explanation = evaluatePreconditions(decode(openXdr), context);

    expect(explanation.verdict).toBe("satisfiable");
    expect(explanation.timeBounds?.status).toBe("satisfied");
    expect(explanation.timeBounds?.minTimeDeltaSeconds).toBe("-3600");
    expect(explanation.timeBounds?.maxTimeDeltaSeconds).toBe("7200");
    expect(explanation.ledgerBounds?.status).toBe("satisfied");
    expect(explanation.ledgerBounds?.ledgersUntilMin).toBe(-1_000);
    expect(explanation.ledgerBounds?.ledgersUntilMax).toBe(5_000);
    expect(explanation.clockSource).toBe("ledger-close-time");
  });

  it("calls out a window whose upper bound has passed", () => {
    const explanation = evaluatePreconditions(decode(expiredXdr), context);

    expect(explanation.verdict).toBe("expired");
    expect(explanation.timeBounds?.status).toBe("expired");
  });

  it("separates not-yet-valid from expired", () => {
    const explanation = evaluatePreconditions(decode(notYetValidXdr), context);

    expect(explanation.verdict).toBe("not_yet");
    expect(explanation.timeBounds?.status).toBe("not_yet");
    expect(explanation.ledgerBounds?.status).toBe("not_yet");
  });

  it("treats a bound equal to the reference clock as still open", () => {
    const decoded = decode(openXdr);
    const atMaxTime = {
      ...decoded,
      timeBounds: { minTime: "0", maxTime: String(currentLedgerClosedAtUnix) }
    };

    expect(evaluatePreconditions(atMaxTime, context).timeBounds?.status).toBe("satisfied");
  });

  it("treats the maxLedger ledger itself as already too late", () => {
    const decoded = decode(openXdr);
    const atMaxLedger = {
      ...decoded,
      timeBounds: null,
      ledgerBounds: { minLedger: 0, maxLedger: currentLedgerSequence }
    };

    expect(evaluatePreconditions(atMaxLedger, context).ledgerBounds?.status).toBe("expired");
  });

  it("marks account-dependent rules without pretending to judge them", () => {
    const explanation = evaluatePreconditions(decode(openXdr), context);

    expect(explanation.accountDependent).toBe(true);
    expect(explanation.minSequenceAge).toBe(String(minAccountSequenceAge));
  });

  it("falls back to the device clock and leaves ledger bounds unknown when degraded", () => {
    const explanation = evaluatePreconditions(decode(ledgerBoundsOnlyXdr), {
      ledger: null,
      degradedReason: "request_failed",
      now: NOW_MS
    });

    expect(explanation.clockSource).toBe("local-clock");
    expect(explanation.ledgerBounds?.status).toBe("unknown");
    expect(explanation.verdict).toBe("unknown");
    expect(explanation.degradedReason).toBe("request_failed");
  });

  it("stamps the answer with the moment it was taken", () => {
    const explanation = evaluatePreconditions(decode(openXdr), context);
    expect(explanation.evaluatedAt).toBe(new Date(NOW_MS).toISOString());
  });
});

describe("verdictOf", () => {
  it("ranks expired above every other outcome", () => {
    expect(verdictOf(["expired", "not_yet", "unknown"])).toBe("expired");
    expect(verdictOf(["not_yet", "unknown"])).toBe("not_yet");
    expect(verdictOf(["unknown", "satisfied"])).toBe("unknown");
    expect(verdictOf(["satisfied"])).toBe("satisfiable");
    expect(verdictOf([])).toBe("satisfiable");
  });
});

describe("normalizeLedgerSnapshot", () => {
  it("reads the newest record", () => {
    expect(
      normalizeLedgerSnapshot({
        _embedded: { records: [{ sequence: 12, closed_at: "2026-05-02T10:14:05.000Z" }] }
      })
    ).toEqual({
      ok: true,
      value: {
        sequence: 12,
        closedAt: "2026-05-02T10:14:05.000Z",
        closedAtUnix: String(Math.floor(Date.parse("2026-05-02T10:14:05.000Z") / 1000))
      }
    });
  });

  it("reports an empty or malformed page as ledger_unavailable", () => {
    expect(normalizeLedgerSnapshot({ _embedded: { records: [] } })).toEqual({
      ok: false,
      code: "ledger_unavailable"
    });
    expect(normalizeLedgerSnapshot({})).toEqual({ ok: false, code: "ledger_unavailable" });
    expect(
      normalizeLedgerSnapshot({ _embedded: { records: [{ sequence: 1, closed_at: "nope" }] } })
    ).toEqual({ ok: false, code: "ledger_unavailable" });
  });
});

describe("fetchLatestLedger", () => {
  it("returns the current ledger and its close time", async () => {
    expect(await fetchLatestLedger("testnet")).toEqual({ ok: true, value: ledgerSnapshot });
  });

  it("reports a page with no ledger in it as ledger_unavailable", async () => {
    server.use(emptyLedgerPageHandler);
    expect(await fetchLatestLedger("testnet")).toEqual({ ok: false, code: "ledger_unavailable" });
  });

  it("reports a 404 as ledger_unavailable", async () => {
    server.use(ledgerNotFoundHandler);
    expect(await fetchLatestLedger("testnet")).toEqual({ ok: false, code: "ledger_unavailable" });
  });

  it("reports a 5xx as request_failed", async () => {
    server.use(serverErrorHandler);
    expect(await fetchLatestLedger("testnet")).toEqual({ ok: false, code: "request_failed" });
  });

  it("reports a dropped connection as request_failed", async () => {
    server.use(transportFailureHandler);
    expect(await fetchLatestLedger("testnet")).toEqual({ ok: false, code: "request_failed" });
  });

  it("reports a cancelled request as request_failed rather than throwing", async () => {
    const controller = new AbortController();
    controller.abort();
    expect(await fetchLatestLedger("testnet", controller.signal)).toEqual({
      ok: false,
      code: "request_failed"
    });
  });
});

describe("explainPreconditions", () => {
  it("combines the decoded envelope with the ledger snapshot", async () => {
    const result = await explainPreconditions({ envelope: openXdr }, "testnet");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.verdict).toBe("satisfiable");
    expect(result.value.ledger).toEqual(ledgerSnapshot);
    expect(result.value.degradedReason).toBeNull();
  });

  it("still answers with the decoded bounds when the ledger cannot be fetched", async () => {
    server.use(serverErrorHandler);
    const result = await explainPreconditions({ envelope: openXdr }, "testnet");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.degradedReason).toBe("request_failed");
    expect(result.value.ledger).toBeNull();
    expect(result.value.timeBounds).not.toBeNull();
    expect(result.value.ledgerBounds?.status).toBe("unknown");
  });

  it("does not reach the network for an envelope it cannot decode", async () => {
    expect(await explainPreconditions({ envelope: notAnEnvelopeXdr }, "testnet")).toEqual({
      ok: false,
      code: "invalid_xdr"
    });
  });

  it("returns no_preconditions rather than an empty explanation", async () => {
    expect(await explainPreconditions({ envelope: unconditionalXdr }, "testnet")).toEqual({
      ok: false,
      code: "no_preconditions"
    });
  });
});

describe("toLedgerFetchErrorCode", () => {
  it("keeps request_failed for the failures worth retrying unchanged", () => {
    expect(toLedgerFetchErrorCode({ response: { status: 500 } })).toBe("request_failed");
    expect(toLedgerFetchErrorCode(new Error("Failed to fetch"))).toBe("request_failed");
    expect(toLedgerFetchErrorCode(new Error("The operation was aborted"))).toBe("request_failed");
  });

  it("uses ledger_unavailable for everything else", () => {
    expect(toLedgerFetchErrorCode({ response: { status: 404 } })).toBe("ledger_unavailable");
    expect(toLedgerFetchErrorCode({ response: { status: 429 } })).toBe("ledger_unavailable");
    expect(toLedgerFetchErrorCode(new Error("something else"))).toBe("ledger_unavailable");
  });
});

describe("isEnvelopeProblem", () => {
  it("separates envelope failures from snapshot failures", () => {
    expect(isEnvelopeProblem("invalid_xdr")).toBe(true);
    expect(isEnvelopeProblem("no_preconditions")).toBe(true);
    expect(isEnvelopeProblem("empty_input")).toBe(true);
    expect(isEnvelopeProblem("ledger_unavailable")).toBe(false);
    expect(isEnvelopeProblem("request_failed")).toBe(false);
  });
});
