import { Droplets } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/testnet-faucet/copy";

export function TestnetFaucetEmptyState() {
  return <EmptyState icon={Droplets} title={copy.emptyTitle} description={copy.emptyDescription} />;
}
