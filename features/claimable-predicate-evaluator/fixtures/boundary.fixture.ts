import { claimantA, claimantB } from "@/features/claimable-predicate-evaluator/fixtures/normal.fixture";
export const relativeBalance = JSON.stringify({ claimants: [
  { destination: claimantA, predicate: { and: [{ rel_before: "60" }, { unconditional: true }] } },
  { destination: claimantB, predicate: { not: { rel_before: "60" } } }
] });
export const creationTime = "2026-11-23T11:59:00Z";
export const malformedUnion = JSON.stringify({ claimants: [{ destination: claimantA, predicate: { unconditional: true, rel_before: "60" } }] });
