"use client";

import { Card } from "@/core/ui/Card";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useHorizonStreamSampler } from "@/features/horizon-stream-sampler/hooks/useHorizonStreamSampler";
import { errorCopy } from "@/features/horizon-stream-sampler/copy";
import { HorizonStreamSamplerForm } from "@/features/horizon-stream-sampler/components/HorizonStreamSamplerForm";
import { HorizonStreamSamplerResult } from "@/features/horizon-stream-sampler/components/HorizonStreamSamplerResult";
import { HorizonStreamSamplerEmptyState } from "@/features/horizon-stream-sampler/components/HorizonStreamSamplerEmptyState";
import { StreamStatus } from "@/features/horizon-stream-sampler/components/StreamStatus";
import { ManualStopControl } from "@/features/horizon-stream-sampler/components/ManualStopControl";
import { SampledEventRows } from "@/features/horizon-stream-sampler/components/SampledEventRows";

export function HorizonStreamSamplerPanel() {
  const { state, submit, stop } = useHorizonStreamSampler();

  return (
    <div className="space-y-5">
      <Card>
        <HorizonStreamSamplerForm onSubmit={submit} pending={state.status === "loading"} />
      </Card>
      {state.status === "loading" ? <div className="space-y-3"><div className="flex items-center gap-3"><StreamStatus connected /><ManualStopControl onStop={stop} /></div><SampledEventRows events={state.events} /></div> : null}

      {state.status === "error" ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? <HorizonStreamSamplerResult result={state.result} /> : null}

      {state.status === "idle" ? <HorizonStreamSamplerEmptyState /> : null}
    </div>
  );
}
