import { useState, type ChangeEvent } from "react";
import { Input } from "@/components/ui/Input";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { detectSecretKey, SECRET_KEY_WARNING } from "@/lib/stellar/secretKeyGuard";

interface AddressInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

export function AddressInput({
  value,
  onChange,
  label = "Stellar public address",
  placeholder = "G..."
}: AddressInputProps) {
  const [warning, setWarning] = useState<string | null>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const raw = event.target.value;

    if (detectSecretKey(raw)) {
      setWarning(SECRET_KEY_WARNING);
      return;
    }

    setWarning(null);
    onChange(raw);
  }

  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-[#29364d]">{label}</span>
      <Input
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        spellCheck={false}
      />
      {warning ? (
        <StatusMessage type="warning" title="Secret key detected" description={warning} />
      ) : null}
    </label>
  );
}
