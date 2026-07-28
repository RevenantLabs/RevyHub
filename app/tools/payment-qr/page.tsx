import { createToolMetadata } from "@/lib/metadata";
import ToolPageClient from "./ToolPageClient";

export const metadata = createToolMetadata("/tools/payment-qr");

export default function Page() {
  return <ToolPageClient />;
}
