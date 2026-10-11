"use client";

import { useState } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/field";
import { copy } from "@/features/sep12-kyc-reference/copy";

interface Props {
  onSubmit: (query: string, category: string) => void;
}

export function Sep12KycReferenceForm({ onSubmit }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(query, category);
      }}
      className="space-y-4"
    >
      <Field label={copy.formLabel} hint={copy.formHint} required>
        {({ inputId, describedBy, invalid }) => (
          <input
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={copy.searchPlaceholder}
            className="w-full rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm text-[#172033] placeholder:text-[#9ca3af] focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
          />
        )}
      </Field>

      <div>
        <label htmlFor="category-filter" className="block text-sm font-bold text-[#172033]">
          {copy.filterLabel}
        </label>
        <select
          id="category-filter"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-1 w-full rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm text-[#172033]"
        >
          <option value="all">{copy.allCategories}</option>
          <option value="personal">{copy.categoryPersonal}</option>
          <option value="entity">{copy.categoryEntity}</option>
          <option value="organization">{copy.categoryOrganization}</option>
        </select>
      </div>

      <Button type="submit">{copy.submit}</Button>
    </form>
  );
}
