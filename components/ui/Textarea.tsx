import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-36 w-full rounded-md border border-[#c7d6e8] bg-white/78 px-4 py-3 font-mono text-sm text-[#172033] outline-none transition placeholder:font-sans placeholder:text-[#8a98aa] focus:border-[#47a8c7] focus:ring-2 focus:ring-[#8edcf4]/35",
        className
      )}
      {...props}
    />
  );
}
