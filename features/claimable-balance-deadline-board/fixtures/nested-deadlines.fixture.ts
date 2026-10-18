import type { RawBalance } from "../lib/claimant-pages";
import { beforeBalance } from "./claimableBalanceDeadlineBoard.fixture";
export const nestedBalance: RawBalance = {
  ...beforeBalance, id: "d".repeat(64), paging_token: "310", claimants: [{
    destination: beforeBalance.claimants[0].destination,
    predicate: { or: [{ and: [{ abs_before: "2026-10-01T00:00:00Z" }, { rel_before: "3600" }] }, { not: { abs_after: "2026-09-01T00:00:00Z" } }] }
  }]
};
export const malformedBalance: RawBalance = { ...nestedBalance, claimants: [{ destination: beforeBalance.claimants[0].destination, predicate: { and: [] } }] };
