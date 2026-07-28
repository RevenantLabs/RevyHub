import { createToolMetadata } from "@/lib/metadata";
import ToolPageClient from "./ToolPageClient";

export const metadata = createToolMetadata("/tools/address-validator");

export default function Page() {
  return <ToolPageClient />;
}
