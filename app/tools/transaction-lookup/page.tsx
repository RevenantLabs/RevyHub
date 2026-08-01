import { createToolMetadata } from "@/lib/metadata";
import ToolPageClient from "./ToolPageClient";

export const metadata = createToolMetadata("/tools/transaction-lookup");

export default function Page() {
  return <ToolPageClient />;
}
