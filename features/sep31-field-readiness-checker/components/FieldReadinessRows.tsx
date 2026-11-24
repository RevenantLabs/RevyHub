import { DataList } from "@/core/ui/DataList"
import { formatChoices } from "@/features/sep31-field-readiness-checker/lib/format"
import type { FieldRow } from "@/features/sep31-field-readiness-checker/types"

export function FieldReadinessRows({ fields }: { fields: FieldRow[] }) {
  if (fields.length === 0) return null
  return (
    <div>
      {fields.map((field) => (
        <section key={field.name} aria-label={field.name}>
          <h3 className="mt-4 text-sm font-extrabold text-[#172033]">{field.name}</h3>
          <DataList
            items={[
              { label: "Status", value: field.status },
              { label: "Reason", value: field.reason },
              { label: "Optional", value: field.optional === null ? "not declared" : field.optional ? "yes" : "no" },
              { label: "Description", value: field.description ?? "not declared" },
              { label: "Choices", value: formatChoices(field) }
            ]}
          />
        </section>
      ))}
    </div>
  )
}
