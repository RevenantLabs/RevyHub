import { ShieldCheck } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "../copy";
export function SorobanAuthNonceExpiryAuditorEmptyState() { return <EmptyState icon={ShieldCheck} title={copy.emptyTitle} description={copy.emptyDescription}/>; }
