import { createToolMetadata } from "@/lib/metadata";
import ToolPageClient from "./ToolPageClient";

export const metadata = createToolMetadata("/tools/balance-viewer");

export default function Page() {
  return <ToolPageClient />;
}
