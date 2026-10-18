import { describe, expect, it } from "vitest";
import { withMswHandlers } from "@/core/testing/msw";
import {
  applyLatestDataSponsorship,
  calculateNetReserveEffectStroops,
  normalizeSponsoredEntries,
  runSponsoredReserves
} from "@/features/sponsored-reserves/lib/sponsoredReserves";
import {
  handlers,
  networkErrorHandler,
  rateLimitedHandler,
  serverErrorHandler
} from "@/features/sponsored-reserves/msw/handlers";
import {
  accountId,
  accountResponse,
  noRelationshipsAccountId,
  offersResponse,
  sponsorA,
  sponsorB,
  unknownAccountId
} from "@/features/sponsored-reserves/fixtures/sponsoredReserves.fixture";

const server = withMswHandlers(...handlers);

describe("applyLatestDataSponsorship", () => {
  function decide(effects: Parameters<typeof applyLatestDataSponsorship>[0], names: string[]) {
    const pending = new Set(names);
    const sponsors = new Map<string, string>();
    applyLatestDataSponsorship(effects, pending, sponsors);
    return { pending, sponsors };
  }

  it("takes the newest decision and stops tracking the entry", () => {
    const { pending, sponsors } = decide(
      [
        {
          type: "data_sponsorship_updated",
          paging_token: "2",
          data_name: "active",
          new_sponsor: sponsorB
        },
        {
          type: "data_sponsorship_created",
          paging_token: "1",
          data_name: "active",
          sponsor: sponsorA
        }
      ],
      ["active"]
    );

    expect([...sponsors]).toEqual([["active", sponsorB]]);
    expect(pending.size).toBe(0);
  });

  it("treats a removal as unsponsored and ignores the older sponsorship", () => {
    const { pending, sponsors } = decide(
      [
        { type: "data_sponsorship_removed", paging_token: "4", data_name: "revoked" },
        {
          type: "data_sponsorship_created",
          paging_token: "3",
          data_name: "revoked",
          sponsor: sponsorA
        }
      ],
      ["revoked"]
    );

    expect(sponsors.size).toBe(0);
    expect(pending.size).toBe(0);
  });

  it("does not attribute a dead entry's sponsor to a recreated entry of the same name", () => {
    const { sponsors } = decide(
      [
        { type: "data_created", paging_token: "6", data_name: "reused" },
        { type: "data_removed", paging_token: "5", data_name: "reused" },
        {
          type: "data_sponsorship_created",
          paging_token: "4",
          data_name: "reused",
          sponsor: sponsorA
        }
      ],
      ["reused"]
    );

    expect(sponsors.size).toBe(0);
  });

  it("leaves an entry pending when no effect decides it", () => {
    const { pending, sponsors } = decide(
      [{ type: "account_credited", paging_token: "9" }],
      ["undecided"]
    );

    expect(sponsors.size).toBe(0);
    expect([...pending]).toEqual(["undecided"]);
  });
});

describe("normalizeSponsoredEntries", () => {
  it("normalises the account entry, trustlines, signers, offers and data into one row shape", () => {
    const entries = normalizeSponsoredEntries(
      accountResponse,
      offersResponse._embedded.records,
      new Map([["kyc-status", sponsorB]])
    );

    expect(entries.map((entry) => entry.kind)).toEqual([
      "account",
      "trustline",
      "signer",
      "offer",
      "data"
    ]);
    expect(entries.every((entry) => entry.sponsor === sponsorA || entry.sponsor === sponsorB)).toBe(
      true
    );
  });

  it("omits the account entry row when the account pays its own reserve", () => {
    const entries = normalizeSponsoredEntries(
      { ...accountResponse, sponsor: undefined },
      [],
      new Map()
    );

    expect(entries.some((entry) => entry.kind === "account")).toBe(false);
  });
});

describe("calculateNetReserveEffectStroops", () => {
  it("uses BigInt reserve arithmetic for relief and obligations", () => {
    expect(calculateNetReserveEffectStroops(6, 2, "5000000")).toBe("20000000");
    expect(calculateNetReserveEffectStroops(1, 3, "5000000")).toBe("-10000000");
  });

  it("stays exact past the float safe range", () => {
    expect(calculateNetReserveEffectStroops(4_000_000_000, 0, "5000000")).toBe(
      "20000000000000000"
    );
  });
});

describe("runSponsoredReserves", () => {
  it("loads every sponsored entry and computes the net XLM effect", async () => {
    const result = await runSponsoredReserves({ accountId }, "testnet");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.sponsoredEntries).toHaveLength(5);
    expect(result.value.sponsoredEntries[0]).toMatchObject({
      kind: "account",
      sponsor: sponsorA
    });
    // The newest effect wins: the data entry was re-sponsored by sponsorB.
    expect(result.value.sponsoredEntries.at(-1)).toMatchObject({
      kind: "data",
      reference: "kyc-status",
      sponsor: sponsorB
    });
    expect(result.value).toMatchObject({
      numSponsoring: 2,
      numSponsored: 6,
      baseReserveStroops: "5000000",
      netReserveEffectStroops: "20000000"
    });
  });

  it("skips the offer and effect requests when nothing is sponsored", async () => {
    const result = await runSponsoredReserves({ accountId: noRelationshipsAccountId }, "testnet");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.sponsoredEntries).toEqual([]);
    expect(result.value.numSponsoring).toBe(0);
    expect(result.value.numSponsored).toBe(0);
  });

  it("maps a 404 to account_not_found", async () => {
    const result = await runSponsoredReserves({ accountId: unknownAccountId }, "testnet");
    expect(result).toEqual({ ok: false, code: "account_not_found" });
  });

  it("maps a 429 to rate_limited", async () => {
    server.use(rateLimitedHandler);
    const result = await runSponsoredReserves({ accountId }, "testnet");
    expect(result).toEqual({ ok: false, code: "rate_limited" });
  });

  it("maps a 5xx response to request_failed", async () => {
    server.use(serverErrorHandler);
    const result = await runSponsoredReserves({ accountId }, "testnet");
    expect(result).toEqual({ ok: false, code: "request_failed" });
  });

  it("maps a transport failure to request_failed", async () => {
    server.use(networkErrorHandler);
    const result = await runSponsoredReserves({ accountId }, "testnet");
    expect(result).toEqual({ ok: false, code: "request_failed" });
  });
});
