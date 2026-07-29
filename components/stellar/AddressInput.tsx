import { Input } from "@/components/ui/Input";

interface AddressInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  readOnly?: boolean;
}

export function AddressInput({
  value,
  onChange,
  label = "Stellar public address",
  placeholder = "G...",
  readOnly = false
}: AddressInputProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-[#29364d]">{label}</span>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        spellCheck={false}
        className={readOnly ? "bg-[#f4f9fc] text-[#516078]" : undefined}
      />
    </label>
  );
}
