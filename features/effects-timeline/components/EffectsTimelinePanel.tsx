"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useEffectsTimeline } from "@/features/effects-timeline/hooks/useEffectsTimeline";
import { copy, errorCopy } from "@/features/effects-timeline/copy";
import { EffectsTimelineForm } from "@/features/effects-timeline/components/EffectsTimelineForm";
import { EffectsTimelineResult } from "@/features/effects-timeline/components/EffectsTimelineResult";
import { EffectsTimelinePager } from "@/features/effects-timeline/components/EffectsTimelinePager";
import { EffectsTimelineEmptyState } from "@/features/effects-timeline/components/EffectsTimelineEmptyState";

export function EffectsTimelinePanel() {
  const { state, submit, showOlder, showNewer } = useEffectsTimeline();

  return (
    <div className="space-y-5">
      <Card>
        <EffectsTimelineForm onSubmit={submit} pending={state.status === "loading"} />
      </Card>

      {state.status === "loading" ? (
        <Card>
          <p className="sr-only" role="status">
            {copy.loading}
          </p>
          <SkeletonRows rows={4} />
        </Card>
      ) : null}

      {state.status === "error" ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? (
        <>
          <EffectsTimelineResult page={state.page} />
          <EffectsTimelinePager
            pageNumber={state.pageIndex + 1}
            hasNewer={state.pageIndex > 0}
            hasOlder={state.page.hasOlder}
            onNewer={showNewer}
            onOlder={showOlder}
          />
        </>
      ) : null}

      {state.status === "idle" ? <EffectsTimelineEmptyState /> : null}
    </div>
  );
}
