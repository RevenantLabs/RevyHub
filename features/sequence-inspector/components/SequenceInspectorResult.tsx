import { copy } from "@/features/sequence-inspector/copy";
import type { SequenceInspectorResult as ResultType } from "@/features/sequence-inspector/types";

interface SequenceInspectorResultProps {
  result: ResultType;
}

export function SequenceInspectorResult({ result }: SequenceInspectorResultProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">{copy.resultTitle}</h2>
      </div>

      <div className="rounded-lg border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-1 divide-y divide-slate-200">
          <div className="p-4 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-slate-500">{copy.currentSequence}</dt>
            <dd className="mt-1 text-sm text-slate-900 sm:col-span-2 sm:mt-0 font-mono break-all select-all">
              {result.sequence}
            </dd>
          </div>
          
          <div className="p-4 sm:grid sm:grid-cols-3 sm:gap-4 bg-slate-50">
            <dt className="text-sm font-medium text-slate-500">Creation Ledger (High 32 bits)</dt>
            <dd className="mt-1 text-sm text-slate-900 sm:col-span-2 sm:mt-0 font-mono break-all select-all">
              {result.ledger}
            </dd>
          </div>
          
          <div className="p-4 sm:grid sm:grid-cols-3 sm:gap-4 bg-slate-50">
            <dt className="text-sm font-medium text-slate-500">Offset (Low 32 bits)</dt>
            <dd className="mt-1 text-sm text-slate-900 sm:col-span-2 sm:mt-0 font-mono break-all select-all">
              {result.offset}
            </dd>
          </div>
          
          <div className="p-4 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-slate-500">{copy.nextSequence}</dt>
            <dd className="mt-1 text-sm text-slate-900 sm:col-span-2 sm:mt-0 font-mono break-all select-all">
              {result.nextSequence}
            </dd>
          </div>
          
          {result.bumpTarget && (
            <div className="p-4 sm:grid sm:grid-cols-3 sm:gap-4 bg-green-50">
              <dt className="text-sm font-medium text-green-800">{copy.bumpTargetValid}</dt>
              <dd className="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0 font-mono break-all select-all">
                {result.bumpTarget}
              </dd>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg bg-blue-50 p-4">
        <h3 className="text-sm font-medium text-blue-800">{copy.ledgerDerived}</h3>
        <p className="mt-2 text-sm text-blue-700">{copy.ledgerExplainer}</p>
      </div>

      <div className="rounded-lg bg-amber-50 p-4">
        <h3 className="text-sm font-medium text-amber-800">{copy.txBadSeq}</h3>
        <p className="mt-2 text-sm text-amber-700">{copy.txBadSeqExplainer}</p>
      </div>
    </div>
  );
}
