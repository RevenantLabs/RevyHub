import { GitBranch } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/claimable-predicate-evaluator/copy";
export function ClaimablePredicateEvaluatorEmptyState() { return <EmptyState icon={GitBranch} title={copy.emptyTitle} description={copy.emptyDescription} />; }
