import { StatusMessage } from "@/core/ui";
import { copy } from "../copy";
import type { RestoreRequirement } from "../types";

export function RestoreRequirements({ restore }: { restore: RestoreRequirement }) {
  return (
    <StatusMessage
      type={restore.restorable ? "info" : "warning"}
      title={restore.restorable ? copy.restorableTitle : copy.notRestorableTitle}
      description={restore.explanation}
    />
  );
}
