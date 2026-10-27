import { Button } from "@/core/ui/Button"; import { copy } from "@/features/horizon-stream-sampler/copy";
export function ManualStopControl({ onStop }: { onStop: () => void }) { return <Button type="button" variant="secondary" onClick={onStop}>{copy.stop}</Button>; }
