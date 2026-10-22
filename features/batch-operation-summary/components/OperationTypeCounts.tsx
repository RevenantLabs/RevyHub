import { copy } from "@/features/batch-operation-summary/copy";
import { formatOperationType } from "@/features/batch-operation-summary/lib/format";
import type { OperationTypeCount } from "@/features/batch-operation-summary/types";

export function OperationTypeCounts({ counts }: { counts: OperationTypeCount[] }) {
  return <table className="w-full text-left text-sm"><caption className="mb-2 text-left font-bold">{copy.typeTitle}</caption><thead><tr><th>{copy.type}</th><th>{copy.count}</th></tr></thead><tbody>{counts.map((item) => <tr key={item.type}><td>{formatOperationType(item.type)}</td><td>{item.count}</td></tr>)}</tbody></table>;
}
