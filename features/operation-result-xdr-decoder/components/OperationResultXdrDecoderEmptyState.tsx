import { ScanSearch } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "../copy";
export function OperationResultXdrDecoderEmptyState() { return <EmptyState icon={ScanSearch} title={copy.emptyTitle} description={copy.emptyDescription} />; }
