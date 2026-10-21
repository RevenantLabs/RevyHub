import { DataList } from "@/core/ui/DataList";
import { copy } from "@/features/ledger-header-decoder/copy";
import { formatCloseTime, formatStroops } from "@/features/ledger-header-decoder/lib/format";
import type { LedgerHeaderDecoderResult } from "@/features/ledger-header-decoder/types";

export function HeaderFieldRows({ result }: { result: LedgerHeaderDecoderResult }) {
  return <DataList items={[
    { label: copy.protocolVersion, value: result.protocolVersion, mono: true },
    { label: copy.ledgerSequence, value: result.ledgerSequence, mono: true },
    { label: copy.closeTime, value: formatCloseTime(result.scpValue.closeTime) },
    { label: copy.baseFee, value: formatStroops(result.baseFee), mono: true },
    { label: copy.baseReserve, value: formatStroops(result.baseReserve), mono: true }
  ]} />;
}
