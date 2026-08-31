"use client";

import { useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { Input, Select } from "@/core/ui/Input";
import { copy } from "@/features/predicate-builder/copy";
import type { RawPredicateForm } from "@/features/predicate-builder/types";

interface PredicateNodeFormProps {
  value: RawPredicateForm;
  onChange: (value: RawPredicateForm) => void;
  onRemove?: () => void;
  depth?: number;
}

function PredicateNodeForm({ value, onChange, onRemove, depth = 0 }: PredicateNodeFormProps) {
  const indent = depth * 16;

  const handleTypeChange = (type: string) => {
    // Reset node when type changes
    onChange({ type, timestamp: "", seconds: "", children: [], child: undefined });
  };

  const handleTimestampChange = (timestamp: string) => {
    onChange({ ...value, timestamp });
  };

  const handleSecondsChange = (seconds: string) => {
    onChange({ ...value, seconds });
  };

  const handleAddChild = () => {
    const newChild: RawPredicateForm = { type: "unconditional" };
    if (value.type === "and" || value.type === "or") {
      onChange({
        ...value,
        children: [...(value.children || []), newChild]
      });
    } else if (value.type === "not") {
      onChange({ ...value, child: newChild });
    }
  };

  const handleRemoveChild = (index: number) => {
    if (value.type === "and" || value.type === "or") {
      const newChildren = [...(value.children || [])];
      newChildren.splice(index, 1);
      onChange({ ...value, children: newChildren });
    }
  };

  const handleChildChange = (index: number, child: RawPredicateForm) => {
    if (value.type === "and" || value.type === "or") {
      const newChildren = [...(value.children || [])];
      newChildren[index] = child;
      onChange({ ...value, children: newChildren });
    } else if (value.type === "not") {
      onChange({ ...value, child });
    }
  };

  return (
    <div className="space-y-3" style={{ marginLeft: `${indent}px` }}>
      <div className="rounded-lg border border-[#c7d6e8] bg-white/50 p-4">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1 space-y-3">
            <Field label={copy.predicateTypeLabel} hint={copy.predicateTypeHint}>
              {({ inputId, describedBy, invalid }) => (
                <Select
                  id={inputId}
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                  value={value.type}
                  onChange={(e) => handleTypeChange(e.target.value)}
                >
                  <option value="unconditional">{copy.predicateTypes.unconditional}</option>
                  <option value="before_absolute">{copy.predicateTypes.before_absolute}</option>
                  <option value="before_relative">{copy.predicateTypes.before_relative}</option>
                  <option value="and">{copy.predicateTypes.and}</option>
                  <option value="or">{copy.predicateTypes.or}</option>
                  <option value="not">{copy.predicateTypes.not}</option>
                </Select>
              )}
            </Field>

            {value.type === "before_absolute" && (
              <Field
                label={copy.timestampLabel}
                hint={copy.timestampHint}
                required
              >
                {({ inputId, describedBy, invalid, required }) => (
                  <Input
                    id={inputId}
                    aria-describedby={describedBy}
                    aria-invalid={invalid}
                    required={required}
                    type="datetime-local"
                    value={value.timestamp || ""}
                    onChange={(e) => handleTimestampChange(e.target.value)}
                    placeholder={copy.timestampPlaceholder}
                  />
                )}
              </Field>
            )}

            {value.type === "before_relative" && (
              <Field
                label={copy.secondsLabel}
                hint={copy.secondsHint}
                required
              >
                {({ inputId, describedBy, invalid, required }) => (
                  <Input
                    id={inputId}
                    aria-describedby={describedBy}
                    aria-invalid={invalid}
                    required={required}
                    type="number"
                    inputMode="numeric"
                    min="1"
                    step="1"
                    value={value.seconds || ""}
                    onChange={(e) => handleSecondsChange(e.target.value)}
                    placeholder={copy.secondsPlaceholder}
                  />
                )}
              </Field>
            )}

            {(value.type === "and" || value.type === "or" || value.type === "not") && (
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddChild}
                >
                  <Plus className="h-4 w-4" aria-hidden />
                  {copy.addCondition}
                </Button>
              </div>
            )}
          </div>

          {onRemove && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              aria-label={copy.removeCondition}
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </Button>
          )}
        </div>
      </div>

      {/* Render children for AND/OR */}
      {(value.type === "and" || value.type === "or") &&
        value.children?.map((child, index) => (
          <PredicateNodeForm
            key={index}
            value={child}
            onChange={(newChild) => handleChildChange(index, newChild)}
            onRemove={() => handleRemoveChild(index)}
            depth={depth + 1}
          />
        ))}

      {/* Render child for NOT */}
      {value.type === "not" && value.child && (
        <PredicateNodeForm
          value={value.child}
          onChange={(newChild) => handleChildChange(0, newChild)}
          depth={depth + 1}
        />
      )}
    </div>
  );
}

export function PredicateBuilderForm({
  onSubmit,
  pending
}: {
  onSubmit: (predicate: RawPredicateForm | null) => void;
  pending: boolean;
}) {
  const [root, setRoot] = useState<RawPredicateForm>({
    type: "unconditional"
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(root);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <PredicateNodeForm value={root} onChange={setRoot} />

      <Button type="submit" disabled={pending}>
        {pending ? copy.encoding : copy.buildPredicate}
      </Button>
    </form>
  );
}
