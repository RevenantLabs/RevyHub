import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/core/lib/cn";

const base =
  "w-full rounded-md border border-[#c7d6e8] bg-white/78 px-4 text-sm text-[#172033] outline-none transition " +
  "placeholder:text-[#8a98aa] focus:border-[#47a8c7] focus:ring-2 focus:ring-[#8edcf4]/35 " +
  "aria-[invalid=true]:border-[#ec5d55] aria-[invalid=true]:focus:ring-[#ff9a8b]/40";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(base, "min-h-12", className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(base, "min-h-28 py-3 font-mono", className)} {...props} />;
}

export function Select({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(base, "min-h-12", className)} {...props} />;
}
