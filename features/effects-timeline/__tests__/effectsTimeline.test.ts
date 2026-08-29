import { describe, expect, it } from "vitest";
import { withMswHandlers } from "@/core/testing/msw";
import { copy } from "@/features/effects-timeline/copy";
import {
  PAGE_SIZE,
  buildEffectFields,
  classifyEffect,
  findMultiEffectExample,
  groupEffectsByTransaction,
  loadEffectsPage,
  normalizeEffects,
  parseEffectId,
  type RawEffect
} from "@/features/effects-timeline/lib/effectsTimeline";
import {
  handlers,
  malformedPageHandler,
  rateLimitedHandler,
  serverErrorHandler,
  transportFailureHandler
} from "@/features/effects-timeline/msw/handlers";
import {
  accountId,
  ascendingEffects,
  descendingEffects,
  issuer,
  pageTwoCursor,
  quietAccountId,
  signerKey,
  sponsor,
  straddlingTransactionId,
  toid,
  unknownAccountId
} from "@/features/effects-timeline/fixtures/effectsTimeline.fixture";

const server = withMswHandlers(...handlers);

describe("parseEffectId", () => {
  it("splits the operation TOID into ledger, transaction and operation", () => {
    const operation = toid(5_000_001, 3, 1);
    const parts = parseEffectId(`${operation.toString().padStart(19, "0")}-0000000002`);

    expect(parts).toEqual({
      operationId: operation.toString(),
      transactionId: ((operation >> 12n) << 12n).toString(),
      ledger: 5_000_001,
      transactionIndex: 3,
      operationIndex: 1,
      effectIndex: 2
    });
  });

  it("gives two operations of the same transaction one transaction id", () => {
    const first = parseEffectId(`${toid(5_000_003, 2, 1)}-0000000001`);
    const second = parseEffectId(`${toid(5_000_003, 2, 3)}-0000000001`);

    expect(first?.transactionId).toBe(second?.transactionId);
    expect(first?.operationId).not.toBe(second?.operationId);
  });

  it("stays exact past the float safe range", () => {
    // Ledger 5,000,010 puts the TOID above 2^53, where Number rounds.
    const parts = parseEffectId(`${toid(5_000_010, 3, 2)}-0000000001`);

    expect(Number.isSafeInteger(Number(parts?.operationId))).toBe(false);
    expect(parts?.ledger).toBe(5_000_010);
    expect(parts?.transactionIndex).toBe(3);
    expect(parts?.operationIndex).toBe(2);
  });

  it("rejects anything that is not a Horizon effect id", () => {
    expect(parseEffectId("not-an-effect-id")).toBeNull();
    expect(parseEffectId("123")).toBeNull();
    expect(parseEffectId("12-34-56")).toBeNull();
    // 19 digits, so the shape matches, but the TOID exceeds int64.
    expect(parseEffectId("9999999999999999999-0000000001")).toBeNull();
  });
});

describe("classifyEffect", () => {
  const at = (type: string, extra: Partial<RawEffect> = {}): RawEffect => ({
    id: "1-1",
    type,
    created_at: "2026-04-01T00:00:00Z",
    ...extra
  });

  it("treats value movement as a balance change", () => {
    for (const type of ["account_credited", "account_debited", "trade", "account_created"]) {
      expect(classifyEffect(at(type))).toBe("balance");
    }
  });

  it("treats settings as configuration changes", () => {
    for (const type of ["signer_created", "trustline_created", "data_updated", "sequence_bumped"]) {
      expect(classifyEffect(at(type))).toBe("configuration");
    }
  });

  it("does not double-count a merge: account_removed is configuration", () => {
    // The lumens an account merge moves are reported separately as a debit and
    // a credit, so counting the removal as a balance change would count twice.
    expect(classifyEffect(at("account_removed"))).toBe("configuration");
  });

  it("keeps sponsorship changes on the configuration side even with a sponsor", () => {
    expect(classifyEffect(at("trustline_sponsorship_created", { sponsor }))).toBe("configuration");
  });

  it("falls back on evidence for an unknown type", () => {
    expect(classifyEffect(at("some_future_effect", { amount: "1.0000000" }))).toBe("balance");
    expect(classifyEffect(at("some_future_effect"))).toBe("configuration");
  });
});

describe("buildEffectFields", () => {
  function fieldsOf(type: string, extra: Partial<RawEffect>) {
    return buildEffectFields({ id: "1-1", type, created_at: "2026-04-01T00:00:00Z", ...extra });
  }

  it("renders the fields each type actually carries", () => {
    expect(fieldsOf("account_credited", { amount: "1200.0000000", asset_type: "native" })).toEqual([
      { key: "amount", value: "1,200 XLM" }
    ]);

    expect(fieldsOf("signer_created", { public_key: signerKey, weight: 2 })).toEqual([
      { key: "signerKey", value: signerKey, identifier: true },
      { key: "signerWeight", value: "2" }
    ]);

    expect(
      fieldsOf("account_thresholds_updated", {
        low_threshold: 1,
        med_threshold: 2,
        high_threshold: 3
      })
    ).toEqual([{ key: "thresholds", value: "1 / 2 / 3" }]);
  });

  it("describes flags in words rather than as booleans", () => {
    const [flags] = fieldsOf("account_flags_updated", {
      auth_required_flag: true,
      auth_revocable_flag: false
    });

    expect(flags.value).toBe(
      `${copy.flagLabels.auth_required} ${copy.flagOn}, ${copy.flagLabels.auth_revocable} ${copy.flagOff}`
    );
  });

  it("says a home domain was cleared instead of rendering nothing", () => {
    expect(fieldsOf("account_home_domain_updated", { home_domain: "" })).toEqual([
      { key: "homeDomain", value: copy.clearedValue }
    ]);
  });

  it("formats both sides of a trade with their own assets", () => {
    const fields = fieldsOf("trade", {
      sold_amount: "40.0000000",
      sold_asset_type: "native",
      bought_amount: "14.5000000",
      bought_asset_type: "credit_alphanum4",
      bought_asset_code: "USDC",
      bought_asset_issuer: issuer,
      offer_id: "4451901"
    });

    expect(fields).toContainEqual({ key: "sold", value: "40 XLM" });
    expect(fields.find((field) => field.key === "bought")?.value).toContain("14.5 USDC");
  });

  it("keeps a sequence number past the safe integer range as a string", () => {
    expect(fieldsOf("sequence_bumped", { new_seq: "21474836480000000" })).toEqual([
      { key: "newSequence", value: "21474836480000000" }
    ]);
  });

  it("omits fields the record does not carry", () => {
    expect(fieldsOf("account_credited", {})).toEqual([]);
  });

  it("surfaces recognisable fields of an unmapped type", () => {
    expect(fieldsOf("some_future_effect", { amount: "2.0000000", asset_type: "native" })).toEqual([
      { key: "amount", value: "2 XLM" }
    ]);
  });
});

describe("normalizeEffects", () => {
  it("refuses a page whose ids cannot be parsed", () => {
    expect(
      normalizeEffects([
        { id: "broken", type: "account_credited", created_at: "2026-04-01T00:00:00Z" }
      ])
    ).toEqual({ ok: false, code: "request_failed" });
  });
});

describe("groupEffectsByTransaction", () => {
  function group(records: RawEffect[]) {
    const normalized = normalizeEffects(records);
    if (!normalized.ok) throw new Error("fixture did not normalise");
    return groupEffectsByTransaction(normalized.value);
  }

  it("keeps Horizon's newest-first order between groups", () => {
    const groups = group(descendingEffects);

    expect(groups.map((entry) => entry.ledger)).toEqual([
      5_000_010, 5_000_009, 5_000_008, 5_000_007, 5_000_006, 5_000_005, 5_000_004, 5_000_003,
      5_000_002
    ]);
  });

  it("orders effects chronologically inside a group, whatever order they arrive in", () => {
    const [newest] = group(descendingEffects);
    const ordered = newest.operations.flatMap((operation) => operation.effects);

    expect(ordered.map((effect) => effect.type)).toEqual([
      "account_debited",
      "trade",
      "account_credited",
      "trustline_sponsorship_created"
    ]);
    expect(newest.operations.map((operation) => operation.operationIndex)).toEqual([1, 2]);

    // Grouping does not lean on the order the records arrived in: feeding the
    // same transaction oldest-first yields the identical chronological group.
    const fromAscending = group(ascendingEffects.slice(-4));
    expect(
      fromAscending[0].operations
        .flatMap((operation) => operation.effects)
        .map((effect) => effect.type)
    ).toEqual(ordered.map((effect) => effect.type));
  });

  it("keeps every effect of one operation in a single operation group", () => {
    const groups = group(descendingEffects);
    const setOptions = groups.find((entry) => entry.ledger === 5_000_009);

    expect(setOptions?.operations).toHaveLength(1);
    expect(setOptions?.operations[0].effects.map((effect) => effect.type)).toEqual([
      "account_home_domain_updated",
      "account_thresholds_updated",
      "signer_created"
    ]);
  });

  it("counts balance and configuration effects separately", () => {
    const groups = group(descendingEffects);
    const pathPayment = groups.find((entry) => entry.ledger === 5_000_010);

    expect(pathPayment).toMatchObject({
      effectCount: 4,
      balanceEffectCount: 3,
      configurationEffectCount: 1
    });
  });

  it("marks only the boundary groups when a boundary is supplied", () => {
    const normalized = normalizeEffects(descendingEffects);
    if (!normalized.ok) throw new Error("fixture did not normalise");

    const groups = groupEffectsByTransaction(normalized.value, {
      continuedFrom: normalized.value[0].transactionId,
      continuesInto: normalized.value.at(-1)?.transactionId
    });

    expect(groups[0].continuedFromNewerPage).toBe(true);
    expect(groups.at(-1)?.continuesOnOlderPage).toBe(true);
    expect(groups.slice(1).every((entry) => !entry.continuedFromNewerPage)).toBe(true);
    expect(groups.slice(0, -1).every((entry) => !entry.continuesOnOlderPage)).toBe(true);
  });
});

describe("findMultiEffectExample", () => {
  it("points at the first operation that produced more than one effect", () => {
    const normalized = normalizeEffects(descendingEffects);
    if (!normalized.ok) throw new Error("fixture did not normalise");

    expect(findMultiEffectExample(groupEffectsByTransaction(normalized.value))).toEqual({
      ledger: 5_000_010,
      transactionIndex: 3,
      operationIndex: 1,
      effectCount: 3
    });
  });

  it("returns null when every operation produced exactly one effect", () => {
    const normalized = normalizeEffects([descendingEffects[0]]);
    if (!normalized.ok) throw new Error("fixture did not normalise");

    expect(findMultiEffectExample(groupEffectsByTransaction(normalized.value))).toBeNull();
  });
});

describe("loadEffectsPage", () => {
  it("shows a full page and reports that an older one exists", async () => {
    const result = await loadEffectsPage({ accountId }, "testnet");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.effectCount).toBe(PAGE_SIZE);
    expect(result.value.hasOlder).toBe(true);
    expect(result.value.olderCursor).toBe(pageTwoCursor);
    expect(result.value.groups[0].continuedFromNewerPage).toBe(false);
  });

  it("never renders the lookahead record it used to detect the end", async () => {
    const result = await loadEffectsPage({ accountId }, "testnet");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const shown = result.value.groups.flatMap((group) =>
      group.operations.flatMap((operation) => operation.effects.map((effect) => effect.id))
    );
    expect(shown).toHaveLength(PAGE_SIZE);
    expect(shown).not.toContain(descendingEffects[PAGE_SIZE].id);
  });

  it("flags the transaction that straddles the page boundary", async () => {
    const result = await loadEffectsPage({ accountId }, "testnet");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.carryTransactionId).toBe(straddlingTransactionId);
    expect(result.value.groups.at(-1)).toMatchObject({
      transactionId: straddlingTransactionId,
      continuesOnOlderPage: true,
      effectCount: 3
    });
  });

  it("labels the continued group on the older page and disables paging at the end", async () => {
    const first = await loadEffectsPage({ accountId }, "testnet");
    expect(first.ok).toBe(true);
    if (!first.ok) return;

    const second = await loadEffectsPage({ accountId }, "testnet", {
      cursor: first.value.olderCursor ?? undefined,
      carryTransactionId: first.value.carryTransactionId ?? undefined
    });

    expect(second.ok).toBe(true);
    if (!second.ok) return;
    expect(second.value.effectCount).toBe(3);
    expect(second.value.hasOlder).toBe(false);
    expect(second.value.olderCursor).toBeNull();
    expect(second.value.groups[0]).toMatchObject({
      transactionId: straddlingTransactionId,
      continuedFromNewerPage: true,
      effectCount: 2
    });
    expect(second.value.groups.at(-1)?.continuesOnOlderPage).toBe(false);
  });

  it("splits the straddling transaction without losing or repeating an effect", async () => {
    const first = await loadEffectsPage({ accountId }, "testnet");
    expect(first.ok).toBe(true);
    if (!first.ok) return;

    const second = await loadEffectsPage({ accountId }, "testnet", {
      cursor: first.value.olderCursor ?? undefined
    });
    expect(second.ok).toBe(true);
    if (!second.ok) return;

    const ids = [first.value, second.value].flatMap((page) =>
      page.groups.flatMap((group) =>
        group.operations.flatMap((operation) => operation.effects.map((effect) => effect.id))
      )
    );

    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toHaveLength(descendingEffects.length);
    expect(new Set(ids)).toEqual(new Set(descendingEffects.map((record) => record.id)));
  });

  it("returns an empty page rather than an error for an account with no effects", async () => {
    const result = await loadEffectsPage({ accountId: quietAccountId }, "testnet");

    expect(result).toEqual({
      ok: true,
      value: {
        accountId: quietAccountId,
        groups: [],
        effectCount: 0,
        hasOlder: false,
        olderCursor: null,
        carryTransactionId: null
      }
    });
  });

  it("maps a 404 to account_not_found", async () => {
    const result = await loadEffectsPage({ accountId: unknownAccountId }, "testnet");
    expect(result).toEqual({ ok: false, code: "account_not_found" });
  });

  it("maps a 429 to rate_limited", async () => {
    server.use(rateLimitedHandler);
    const result = await loadEffectsPage({ accountId }, "testnet");
    expect(result).toEqual({ ok: false, code: "rate_limited" });
  });

  it("maps a 5xx to request_failed", async () => {
    server.use(serverErrorHandler);
    const result = await loadEffectsPage({ accountId }, "testnet");
    expect(result).toEqual({ ok: false, code: "request_failed" });
  });

  it("maps a transport failure to request_failed", async () => {
    server.use(transportFailureHandler);
    const result = await loadEffectsPage({ accountId }, "testnet");
    expect(result).toEqual({ ok: false, code: "request_failed" });
  });

  it("maps an unparseable page to request_failed instead of throwing", async () => {
    server.use(malformedPageHandler);
    const result = await loadEffectsPage({ accountId }, "testnet");
    expect(result).toEqual({ ok: false, code: "request_failed" });
  });

  it("aborts without throwing when the caller cancels", async () => {
    const controller = new AbortController();
    controller.abort();

    const result = await loadEffectsPage({ accountId }, "testnet", {
      signal: controller.signal
    });

    expect(result.ok).toBe(false);
  });
});
