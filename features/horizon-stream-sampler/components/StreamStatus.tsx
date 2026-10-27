import { Badge } from "@/core/ui/Badge"; import { copy } from "@/features/horizon-stream-sampler/copy";
export function StreamStatus({ connected }: { connected: boolean }) { return <p role="status"><Badge tone={connected ? "success" : "info"}>{connected ? copy.connected : copy.disconnected}</Badge></p>; }
