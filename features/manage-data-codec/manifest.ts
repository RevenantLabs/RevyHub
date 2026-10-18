import { Binary } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "manage-data-codec",
  title: "Manage-Data Payload Encoding Workbench",
  description:
    "Build a manage-data entry byte by byte — UTF-8, hex or base64 — and see the exact operation XDR it produces, with deleting kept distinct from setting an empty value.",
  character: "A typesetter counts the letters in bytes, not in glyphs.",
  category: "accounts",
  status: "working",
  icon: Binary,
  networks: [],
  offline: true,
  keywords: [
    "manage data",
    "data entry",
    "hex",
    "base64",
    "utf-8",
    "bytes",
    "xdr",
    "operation",
    "delete"
  ]
};
