import { Badge, type BadgeProps } from "@/core/ui";
import { copy } from "../copy";
import type { LivenessState } from "../types";

const TONE: Record<LivenessState["kind"], NonNullable<BadgeProps["tone"]>> = {
  live: "success",
  pending_eviction: "warning",
  archived: "danger",
  expired_temporary: "muted"
};

export function EntryStateBadge({ liveness }: { liveness: LivenessState }) {
  return <Badge tone={TONE[liveness.kind]}>{copy.livenessLabels[liveness.kind]}</Badge>;
}
