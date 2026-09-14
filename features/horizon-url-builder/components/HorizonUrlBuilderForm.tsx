"use client";

import { useState } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/field";
import { copy } from "@/features/horizon-url-builder/copy";
import type { HorizonNetwork, HorizonResource } from "@/features/horizon-url-builder/types";

interface Props {
  onBuild: (config: any) => void;
}

const RESOURCES: HorizonResource[] = ["accounts", "transactions", "operations", "payments", "offers", "trades", "liquidity_pools", "assets", "order_book"];

export function HorizonUrlBuilderForm({ onBuild }: Props) {
  const [resource, setResource] = useState<HorizonResource>("accounts");
  const [network, setNetwork] = useState<HorizonNetwork>("mainnet");
  const [cursor, setCursor] = useState("");
  const [limit, setLimit] = useState("20");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onBuild({
          resource,
          network,
          cursor: cursor || undefined,
          limit: limit ? Number(limit) : undefined,
          order,
        });
      }}
      className="space-y-4"
    >
      <Field label={copy.formLabel} hint={copy.formHint} required>
        {({ inputId, describedBy, invalid }) => (
          <select
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            value={resource}
            onChange={(e) => setResource(e.target.value as HorizonResource)}
            className="w-full rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm text-[#172033]"
          >
            {RESOURCES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        )}
      </Field>

      <div>
        <label htmlFor="url-network" className="block text-sm font-bold text-[#172033]">
          {copy.networkLabel}
        </label>
        <select
          id="url-network"
          value={network}
          onChange={(e) => setNetwork(e.target.value as HorizonNetwork)}
          className="mt-1 w-full rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm text-[#172033]"
        >
          <option value="mainnet">Mainnet</option>
          <option value="testnet">Testnet</option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label htmlFor="url-cursor" className="block text-sm font-bold text-[#172033]">Cursor</label>
          <input
            id="url-cursor"
            type="text"
            value={cursor}
            onChange={(e) => setCursor(e.target.value)}
            placeholder="cursor..."
            className="mt-1 w-full rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="url-limit" className="block text-sm font-bold text-[#172033]">Limit</label>
          <input
            id="url-limit"
            type="number"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            min="1"
            max="200"
            className="mt-1 w-full rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="url-order" className="block text-sm font-bold text-[#172033]">Order</label>
          <select
            id="url-order"
            value={order}
            onChange={(e) => setOrder(e.target.value as "asc" | "desc")}
            className="mt-1 w-full rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>

      <Button type="submit">{copy.submit}</Button>
    </form>
  );
}
