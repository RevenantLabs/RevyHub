import { cn } from "@/core/lib/cn";

export function CodeBlock({
  children,
  label,
  className
}: {
  children: string;
  label?: string;
  className?: string;
}) {
  return (
    <figure className={cn("space-y-2", className)}>
      {label ? (
        <figcaption className="text-xs font-bold uppercase tracking-wide text-[#68758a]">
          {label}
        </figcaption>
      ) : null}
      <pre className="overflow-x-auto rounded-md border border-[#c7d6e8] bg-[#f7fafd] p-4 text-xs leading-6 text-[#172033]">
        <code>{children}</code>
      </pre>
    </figure>
  );
}
