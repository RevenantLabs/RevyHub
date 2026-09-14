import { BookOpen } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "horizon-pagination-inspector",
  title: "Horizon Pagination Response Inspector",
  description:
    "Decode and inspect Horizon paginated response links, cursors, and record sets — fully offline.",
  character: "Every page has a next and a previous — know where you are in the chain.",
  category: "developer",
  status: "working",
  icon: BookOpen,
  networks: [],
  offline: true,
  keywords: ["horizon", "pagination", "cursor", "links", "developer"],
};
