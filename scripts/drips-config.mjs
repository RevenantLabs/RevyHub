/**
 * Active Drips publication target.
 *
 * Kept separate from `grantfox-config.mjs` on purpose: an issue must never
 * carry both programmes' labels, and a campaign change on one side must not be
 * able to relabel the other's backlog.
 *
 * Drips registers issues through its own wave-program API rather than through
 * GitHub labels, so `requiredLabels` here is what makes the programme visible
 * to a human reading the repository — not what Drips itself matches on.
 */
export const dripsConfig = Object.freeze({
  programId: "fdc01c95-806f-4b6a-998b-a6ed37e0d81b",
  programSlug: "stellar",
  programName: "Stellar Wave",
  repositoryId: "1302133299",
  repository: "RevenantLabs/RevyHub",
  requiredLabels: ["Stellar Wave"],
  /** Drips issues are released in a single batch of ten. */
  batchSize: 10
});
