import { ListOrdered } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "horizon-pagination-inspector",
  title: "Horizon Pagination Response Inspector",
  description:
    "Paste a Horizon collection response and read its paging links, cursor tokens, record count and duplicate or missing identifiers. Nothing is transmitted.",
  character:
    "A route-marker reads a map that stops mid-trail, and refuses to claim the road ends just because the ink ran out.",
  category: "developer",
  status: "beta",
  icon: ListOrdered,
  networks: [],
  offline: true,
  keywords: [
    "horizon",
    "pagination",
    "cursor",
    "paging token",
    "next",
    "prev",
    "records",
    "collection"
  ]
};
