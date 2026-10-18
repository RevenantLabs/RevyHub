import { useId, type ReactNode } from "react";
import { cn } from "@/core/lib/cn";

export interface FieldRenderProps {
  inputId: string;
  describedBy: string | undefined;
  invalid: boolean;
  required: boolean;
}

export interface FieldProps {
  label: string;
  hint?: ReactNode;
  error?: string | null;
  required?: boolean;
  className?: string;
  /** Receives the props the control must spread for accessible labelling. */
  children: (props: FieldRenderProps) => ReactNode;
}

/**
 * Wires a label, hint and error message to a control with correct
 * `aria-describedby` / `aria-invalid` plumbing so every slice gets the same
 * accessible form behaviour for free.
 *
 * The required marker is a decorative `aria-hidden` sibling of the label
 * rather than part of it: keeping it out of the label element means the
 * control's accessible name is exactly the label text, and the requirement
 * itself is carried by the control's own `required` attribute.
 */
export function Field({ label, hint, error, required = false, className, children }: FieldProps) {
  const inputId = useId();
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-1">
        <label htmlFor={inputId} className="block text-sm font-bold text-[#172033]">
          {label}
        </label>
        {required ? (
          <span className="text-sm font-bold text-[#ec5d55]" aria-hidden>
            *
          </span>
        ) : null}
      </div>

      {children({ inputId, describedBy: describedBy || undefined, invalid: Boolean(error), required })}

      {hint ? (
        <p id={hintId} className="text-xs leading-5 text-[#68758a]">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} role="alert" className="text-xs font-semibold text-[#9f342d]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
