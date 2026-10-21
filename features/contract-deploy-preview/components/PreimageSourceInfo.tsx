import { DataList, type DataListItem } from "@/core/ui";
import { copy } from "../copy";
import { shortenHex } from "../lib/format";
import type { PreimageSource } from "../types";

export function PreimageSourceInfo({ preimage }: { preimage: PreimageSource }) {
  const items: DataListItem[] =
    preimage.kind === "address"
      ? [
          { label: copy.preimageAddressLabel, value: preimage.address, mono: true },
          { label: "Salt", value: shortenHex(preimage.saltHex, 10), mono: true }
        ]
      : [{ label: copy.preimageAssetLabel, value: preimage.asset, mono: true }];

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-bold text-[#4e5c73]">{copy.preimageTitle}</h3>
      <DataList items={items} />
      <p className="text-xs text-[#4e5c73]">{copy.preimageNote}</p>
    </div>
  );
}
