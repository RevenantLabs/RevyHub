import { createToolMetadata } from "@/lib/metadata";
import ToolPageClient from "./ToolPageClient";

export const metadata = createToolMetadata("/tools/freighter-connect");

export default function Page() {
  return <ToolPageClient />;
}
