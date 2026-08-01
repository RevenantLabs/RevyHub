import { createToolMetadata } from "@/lib/metadata";
import ToolPageClient from "./ToolPageClient";

export const metadata = createToolMetadata("/tools/trustline-checker");

export default function Page() {
  return <ToolPageClient />;
}
