import { DataList, type DataListItem } from "@/core/ui";
import { copy } from "../copy";
import { formatArgCount } from "../lib/format";
import type { ConstructorArgSummary } from "../types";

export function ConstructorArgRows({ args }: { args: ConstructorArgSummary[] }) {
  const items: DataListItem[] = args.map((arg) => ({
    label: `#${arg.index} (${arg.scValType})`,
    value: arg.display,
    mono: true
  }));

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-bold text-[#4e5c73]">{copy.constructorArgsTitle}</h3>
      <p className="text-xs text-[#4e5c73]">{formatArgCount(args.length)}</p>
      {args.length > 0 ? <DataList items={items} /> : <p>{copy.noConstructorArgs}</p>}
    </div>
  );
}
