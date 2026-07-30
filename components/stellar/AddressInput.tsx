import { useId } from "react";
import { FieldError } from "@/components/ui/FieldError";
import { Input } from "@/components/ui/Input";

interface AddressInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string | null;
  id?: string;
}

export function AddressInput({
  value,
  onChange,
  label = "Stellar public address",
  placeholder = "G...",
  error,
  id: idProp,
}: AddressInputProps) {
  const generatedId = useId();
  const inputId = idProp ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="text-sm font-medium text-[#29364d]">
        {label}
      </label>
      <Input
        id={inputId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
      />
      <FieldError id={errorId} message={error} />
    </div>
  );
}
