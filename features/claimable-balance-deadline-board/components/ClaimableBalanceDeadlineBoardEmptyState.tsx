import { Clock3 } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "../copy";
export function ClaimableBalanceDeadlineBoardEmptyState() { return <EmptyState icon={Clock3} title={copy.emptyTitle} description={copy.emptyDescription} />; }
