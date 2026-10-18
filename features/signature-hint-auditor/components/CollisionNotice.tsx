import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy } from "@/features/signature-hint-auditor/copy";

/**
 * Explains ambiguous and missing hints once per result.
 *
 * Shown whenever any decorated hint is unmatched or collides so the user is
 * never left wondering why a row has zero or many candidates.
 */
export function CollisionNotice({
  collisionCount,
  unmatchedCount
}: {
  collisionCount: number;
  unmatchedCount: number;
}) {
  if (collisionCount === 0 && unmatchedCount === 0) return null;

  return (
    <StatusMessage
      type="info"
      title={copy.collisionNoticeTitle}
      description={`${copy.collisionNoticeBody} ${copy.labelCollisions}: ${collisionCount}. ${copy.labelUnmatched}: ${unmatchedCount}.`}
    />
  );
}
