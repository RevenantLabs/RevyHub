import { copy } from "@/features/sequence-inspector/copy";

export function SequenceInspectorEmptyState() {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-6 py-12 text-center">
      <h3 className="text-lg font-medium text-slate-900">{copy.emptyTitle}</h3>
      <p className="mt-2 text-sm text-slate-500">{copy.emptyDescription}</p>
    </div>
  );
}
