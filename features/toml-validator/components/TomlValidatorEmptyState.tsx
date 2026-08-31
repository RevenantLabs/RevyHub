import { Sparkles } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/toml-validator/copy";

export function TomlValidatorEmptyState() {
  return (
    <EmptyState icon={Sparkles} title={copy.emptyTitle} description={copy.emptyDescription} />
  );
}
