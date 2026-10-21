import { Gauge } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/horizon-rate-limit-monitor/copy";
export function HorizonRateLimitMonitorEmptyState() { return <EmptyState icon={Gauge} title={copy.emptyTitle} description={copy.emptyDescription} />; }
