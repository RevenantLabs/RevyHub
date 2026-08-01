import { createToolMetadata } from "@/lib/metadata";
import ToolPageClient from "./ToolPageClient";

export const metadata = createToolMetadata("/tools/testnet-faucet");

export default function Page() {
  return <ToolPageClient />;
}
