import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { CopyableValue } from "@/core/ui/CopyableValue";
import { copy } from "@/features/payment-receipt-reconciler/copy";
import {
  formatAmountWithAsset,
  formatEffectType
} from "@/features/payment-receipt-reconciler/lib/format";
import type { EffectLink } from "@/features/payment-receipt-reconciler/types";

export function EffectEvidence({ links }: { links: EffectLink[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.effectsTitle}</CardTitle>
      </CardHeader>

      <ul className="space-y-4">
        {links.map((link) => (
          <li key={link.operationId} className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-[#8a98aa]">
              {copy.operationIdLabel}:{" "}
              <CopyableValue
                label={copy.operationIdLabel}
                value={link.operationId}
                visible={6}
              />
            </p>

            <EffectGroup title={copy.linkedDebits} effects={link.debits} />
            <EffectGroup title={copy.linkedCredits} effects={link.credits} />
          </li>
        ))}
      </ul>
    </Card>
  );
}

function EffectGroup({
  title,
  effects
}: {
  title: string;
  effects: EffectLink["debits"];
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-[#172033]">{title}</h3>
      <ul className="space-y-2">
        {effects.map((effect) => (
          <li
            key={effect.id}
            className="rounded-md border border-[#e3ebf5] bg-white/60 px-3 py-2 text-sm"
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-semibold text-[#172033]">
                {formatEffectType(effect.type)}
              </span>
              <CopyableValue label={copy.effectIdLabel} value={effect.id} visible={8} />
            </div>
            <dl className="mt-1 grid gap-1 text-[#68758a]">
              <div className="flex flex-wrap gap-x-2">
                <dt>{copy.accountLabel}</dt>
                <dd>
                  <CopyableValue label={copy.accountLabel} value={effect.account} visible={4} />
                </dd>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <dt>{copy.amountLabel}</dt>
                <dd className="font-mono text-[#172033]">
                  {formatAmountWithAsset(effect.amount, effect.asset)}
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </div>
  );
}
