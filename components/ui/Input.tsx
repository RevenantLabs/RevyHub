import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  const ariaInvalid = props["aria-invalid"];

  return (
    <input
      className={cn(
        "min-h-12 w-full rounded-md border border-[#c7d6e8] bg-white/78 px-4 text-sm text-[#172033] outline-none transition placeholder:text-[#8a98aa] focus:border-[#47a8c7] focus:ring-2 focus:ring-[#8edcf4]/35",
        ariaInvalid && "border-[#ff9a8b] focus:border-[#ff9a8b] focus:ring-[#ff9a8b]/35",
        className
      )}
      aria-invalid={ariaInvalid}
      {...props}
    />
  );
}
