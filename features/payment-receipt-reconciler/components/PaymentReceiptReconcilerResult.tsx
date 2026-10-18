"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { Button } from "@/core/ui/Button";
import { CopyableValue } from "@/core/ui/CopyableValue";
import { DataList } from "@/core/ui/DataList";
import { copyText } from "@/core/lib/clipboard";
import { copy } from "@/features/payment-receipt-reconciler/copy";
import { EffectEvidence } from "@/features/payment-receipt-reconciler/components/EffectEvidence";
import { PaymentOperations } from "@/features/payment-receipt-reconciler/components/PaymentOperations";
import { ReceiptTotals } from "@/features/payment-receipt-reconciler/components/ReceiptTotals";
import {
  formatNetwork,
  formatPublicReceipt,
  formatTimestamp
} from "@/features/payment-receipt-reconciler/lib/format";
import type { PaymentReceipt } from "@/features/payment-receipt-reconciler/types";

export function PaymentReceiptReconcilerResult({ result }: { result: PaymentReceipt }) {
  const [copied, setCopied] = useState(false);
  const publicText = formatPublicReceipt(result.publicReceipt);

  async function handleCopyReceipt() {
    try {
      await copyText(publicText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{copy.publicReceiptTitle}</CardTitle>
        </CardHeader>
        <DataList
          items={[
            {
              label: copy.hashLabel,
              value: (
                <CopyableValue label={copy.hashLabel} value={result.publicReceipt.hash} visible={8} />
              )
            },
            {
              label: copy.networkLabel,
              value: formatNetwork(result.publicReceipt.network)
            },
            {
              label: copy.ledgerLabel,
              value: String(result.publicReceipt.ledger),
              mono: true
            }
          ]}
        />
        <div className="mt-3">
          <Button type="button" variant="secondary" size="sm" onClick={handleCopyReceipt}>
            {copied ? copy.copiedReceipt : copy.copyReceipt}
          </Button>
          <span className="sr-only" role="status" aria-live="polite">
            {copied ? copy.copiedReceipt : ""}
          </span>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.resultTitle}</CardTitle>
        </CardHeader>
        <DataList
          items={[
            {
              label: "Source account",
              value: (
                <CopyableValue label="source account" value={result.sourceAccount} visible={4} />
              )
            },
            { label: "Created", value: formatTimestamp(result.createdAt) }
          ]}
        />
      </Card>

      <PaymentOperations operations={result.operations} />
      <EffectEvidence links={result.links} />
      <ReceiptTotals totals={result.totals} />

      <Card>
        <CardHeader>
          <CardTitle>{copy.outsideTitle}</CardTitle>
        </CardHeader>
        {result.outside.length === 0 ? (
          <p className="text-sm text-[#68758a]">{copy.noOutside}</p>
        ) : (
          <>
            <p className="mb-3 text-sm text-[#68758a]">{copy.outsideDescription}</p>
            <ul className="space-y-2">
              {result.outside.map((item) => (
                <li
                  key={`${item.kind}-${item.id}`}
                  className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-[#e3ebf5] bg-white/60 px-3 py-2 text-sm"
                >
                  <span className="text-xs uppercase tracking-wide text-[#8a98aa]">
                    {item.kind}
                  </span>
                  <span className="font-semibold text-[#172033]">
                    {item.type.replace(/_/g, " ")}
                  </span>
                  <CopyableValue label={`${item.kind} id`} value={item.id} visible={6} />
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>
    </div>
  );
}
