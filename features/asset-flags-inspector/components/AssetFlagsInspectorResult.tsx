import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { copy } from "@/features/asset-flags-inspector/copy";
import type { AssetFlagsInspectorResult as AssetFlagsInspectorResultValue } from "@/features/asset-flags-inspector/types";
import { CheckCircle2, AlertCircle, Info, Lock } from "lucide-react";

export function AssetFlagsInspectorResult({ result }: { result: AssetFlagsInspectorResultValue }) {
  const { authRequired, authRevocable, authImmutable, authClawbackEnabled } = result.flags;
  
  const hasNoFlags = !authRequired && !authRevocable && !authImmutable && !authClawbackEnabled;
  const fullControl = authRequired && authRevocable;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.resultTitle}</CardTitle>
      </CardHeader>
      <div className="space-y-6">
        <p className="text-sm text-slate-500 bg-slate-50 p-3 rounded-md flex gap-2 items-start">
          <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
          <span>{copy.disclaimer}</span>
        </p>

        {hasNoFlags ? (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-900">{copy.noFlagsTitle}</h3>
            <p className="text-sm text-slate-500">{copy.noFlagsDescription}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {fullControl && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex gap-3 text-amber-900">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
                <p className="text-sm font-medium">{copy.fullIssuerControl}</p>
              </div>
            )}

            <ul className="space-y-3">
              {authRequired && (
                <li className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-sm font-medium text-slate-900">{copy.flagAuthRequiredName}</strong>
                    <span className="text-sm text-slate-600">{copy.flagAuthRequiredDesc}</span>
                  </div>
                </li>
              )}
              {authRevocable && (
                <li className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-sm font-medium text-slate-900">{copy.flagAuthRevocableName}</strong>
                    <span className="text-sm text-slate-600">{copy.flagAuthRevocableDesc}</span>
                  </div>
                </li>
              )}
              {authClawbackEnabled && (
                <li className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-sm font-medium text-slate-900">{copy.flagAuthClawbackEnabledName}</strong>
                    <span className="text-sm text-slate-600">{copy.flagAuthClawbackEnabledDesc}</span>
                  </div>
                </li>
              )}
              {authImmutable && (
                <li className="flex gap-3 p-3 bg-slate-50 rounded-md border border-slate-100">
                  <Lock className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-sm font-medium text-slate-900">{copy.flagAuthImmutableName}</strong>
                    <span className="text-sm text-slate-600">{copy.flagAuthImmutableDesc}</span>
                  </div>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}
