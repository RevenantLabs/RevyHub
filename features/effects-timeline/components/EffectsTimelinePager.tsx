"use client";

import { Button } from "@/core/ui/Button";
import { copy } from "@/features/effects-timeline/copy";
import { PAGE_SIZE } from "@/features/effects-timeline/lib/effectsTimeline";

/**
 * Cursor paging controls.
 *
 * Both directions are always rendered and disabled at their end, so the
 * control never moves under the pointer and a screen-reader user hears why the
 * button cannot be used rather than finding it gone.
 */
export function EffectsTimelinePager({
  pageNumber,
  hasNewer,
  hasOlder,
  onNewer,
  onOlder
}: {
  pageNumber: number;
  hasNewer: boolean;
  hasOlder: boolean;
  onNewer: () => void;
  onOlder: () => void;
}) {
  return (
    <nav aria-label={copy.pagerLabel} className="flex flex-wrap items-center gap-3">
      <Button type="button" variant="secondary" onClick={onNewer} disabled={!hasNewer}>
        {copy.newerPage}
      </Button>
      <Button type="button" variant="secondary" onClick={onOlder} disabled={!hasOlder}>
        {copy.olderPage}
      </Button>
      <p className="text-sm text-[#4e5c73]">
        <span className="font-bold">{copy.pagePosition(pageNumber)}</span>{" "}
        <span className="text-[#68758a]">{copy.pageSizeNote(PAGE_SIZE)}</span>
      </p>
      {!hasNewer || !hasOlder ? (
        <p className="text-sm text-[#68758a]">
          {!hasNewer ? copy.atNewestEnd : null}
          {!hasNewer && !hasOlder ? " " : null}
          {!hasOlder ? copy.atOldestEnd : null}
        </p>
      ) : null}
    </nav>
  );
}
