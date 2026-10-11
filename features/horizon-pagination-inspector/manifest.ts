import { ListFilter } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "horizon-pagination-inspector",
  title: "Horizon Pagination Response Inspector",
  description:
    "Inspect a pasted Horizon collection response offline to explain its paging links, record count, cursor tokens and duplicate or missing identifiers.",
  character:
    "A meticulous clerk audits the collection ledger page, verifying every cursor and bookmark without walking an inch.",
  category: "developer",
  status: "working",
  icon: ListFilter,
  networks: [],
  offline: true,
  keywords: [
    "horizon",
    "pagination",
    "cursor",
    "paging",
    "token",
    "hal",
    "embedded",
    "records",
    "links",
    "limit",
    "order"
  ]
};
