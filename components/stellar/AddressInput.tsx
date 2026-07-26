"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/Input";
import { detectSecretKey, type SecretKeyDetection } from "@/lib/stellar/detectSecretKey";

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
  placeholder = "G...",
}: AddressInputProps) {
  const [warning, setWarning] = useState("");

  const handleChange = useCallback(
    (newValue: string) => {
      // Detect secret keys before they reach validation or the network
      const detection: SecretKeyDetection = detectSecretKey(newValue);

      if (detection.detected) {
        setWarning(detection.reason);
        // Still pass the value so the user can see what they typed
        // and correct it — but the warning blocks submission.
      } else {
        setWarning("");
      }

      onChange(newValue);
    },
    [onChange],
  );

  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-[#29364d]">{label}</span>
      <Input
        value={value}
        onChange={(event) => handleChange(event.target.value)}
        placeholder={placeholder}
        spellCheck={false}
      />
      {warning && (
        <p className="text-sm font-medium text-red-600 animate-pulse">
          ⚠️ {warning}
        </p>
      )}
    </label>
  );
}
