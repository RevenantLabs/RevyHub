import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/core/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[#ff8b7a] text-white shadow-[4px_4px_0_#9bdcc8,0_0_26px_rgba(111,212,255,0.18)] hover:bg-[#ff765f]",
  secondary:
    "bg-[#d9f4ff] text-[#172033] shadow-[4px_4px_0_rgba(199,185,243,0.55)] hover:bg-[#c5edff]",
  ghost: "bg-transparent text-[#8a5a4c] hover:bg-white/64",
  danger: "bg-[#ec5d55] text-white shadow-[4px_4px_0_rgba(255,196,184,0.8)] hover:bg-[#d94b43]"
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-8 px-3 py-1 text-xs",
  md: "min-h-11 px-4 py-2 text-sm"
};

export function Button({ className, variant = "primary", size = "md", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md border border-black/10 font-extrabold transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#47a8c7] focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        sizes[size],
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
