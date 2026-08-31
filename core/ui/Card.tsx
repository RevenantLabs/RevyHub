import type { HTMLAttributes } from "react";
import { cn } from "@/core/lib/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border border-white/80 bg-white/75 p-5 backdrop-blur-xl",
        "shadow-[0_0_0_1px_rgba(255,255,255,0.72),6px_6px_0_rgba(255,139,122,0.18),0_22px_60px_rgba(84,102,136,0.16)]",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-4 space-y-1", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-lg font-bold text-[#172033]", className)} {...props} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm leading-6 text-[#4e5c73]", className)} {...props} />;
}
