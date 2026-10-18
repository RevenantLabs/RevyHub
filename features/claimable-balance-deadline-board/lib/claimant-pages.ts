import { horizonUrl } from "@/core/horizon/client";
import type { StellarNetwork } from "@/core/network/types";
import type { DeadlineBoardInput } from "../types";

export interface RawBalance { id: string; amount: string; asset: string; paging_token: string; claimants: { destination: string; predicate: unknown }[] }
export interface PageResult { records: RawBalance[]; pagesFetched: number; limitReached: boolean; nextCursor?: string }
export class PageDecodeError extends Error {}
export class CursorProgressError extends Error {}
const PAGE_SIZE = 200;
const MAX_PAGES = 3;

export async function fetchClaimantPages(input: DeadlineBoardInput, network: StellarNetwork, signal?: AbortSignal): Promise<PageResult> {
  const records: RawBalance[] = [];
  const seen = new Set<string>();
  let cursor = input.cursor;
  for (let pageNumber = 1; pageNumber <= MAX_PAGES; pageNumber++) {
    const response = await fetch(horizonUrl(network, "/claimable_balances", { claimant: input.claimant, cursor, limit: PAGE_SIZE, order: "asc" }), { signal, headers: { Accept: "application/json" } });
    if (!response.ok) throw Object.assign(new Error("Horizon request failed"), { status: response.status });
    const body: unknown = await response.json();
    if (!body || typeof body !== "object" || !("_embedded" in body) || !body._embedded || typeof body._embedded !== "object" || !("records" in body._embedded) || !Array.isArray(body._embedded.records)) throw new PageDecodeError();
    const next: unknown[] = body._embedded.records;
    if (next.length > PAGE_SIZE) throw new PageDecodeError();
    let previousToken = cursor ? BigInt(cursor) : undefined;
    for (const value of next) {
      if (!value || typeof value !== "object" || !("paging_token" in value) || typeof value.paging_token !== "string" || !/^\d+$/.test(value.paging_token) || !("id" in value) || typeof value.id !== "string" || !("amount" in value) || typeof value.amount !== "string" || !("asset" in value) || typeof value.asset !== "string" || !("claimants" in value) || !Array.isArray(value.claimants) || !value.claimants.every((claimant) => claimant && typeof claimant === "object" && typeof claimant.destination === "string" && "predicate" in claimant)) throw new PageDecodeError();
      const token = BigInt(value.paging_token);
      if (previousToken !== undefined && token < previousToken) throw new CursorProgressError();
      previousToken = token;
      if (!seen.has(value.paging_token)) { seen.add(value.paging_token); records.push(value as RawBalance); }
    }
    if (next.length && cursor && previousToken! <= BigInt(cursor)) throw new CursorProgressError();
    if (next.length < PAGE_SIZE) return { records, pagesFetched: pageNumber, limitReached: false, nextCursor: next.length ? (next.at(-1) as RawBalance).paging_token : cursor };
    const nextCursor = (next.at(-1) as RawBalance).paging_token;
    cursor = nextCursor;
    if (pageNumber === MAX_PAGES) return { records, pagesFetched: pageNumber, limitReached: true, nextCursor };
  }
  throw new CursorProgressError();
}
