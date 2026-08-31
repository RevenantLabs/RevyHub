import { FileBadge } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "asset-metadata",
  title: "Asset Metadata Discovery",
  description:
    "Read a domain's stellar.toml and show the assets it declares under SEP-0001, with full provenance.",
  character: "A librarian who fetches the catalogue card and tells you who wrote it.",
  category: "assets",
  status: "working",
  icon: FileBadge,
  networks: [],
  keywords: ["stellar.toml", "sep-0001", "asset", "issuer", "metadata", "currencies", "anchor"]
};
