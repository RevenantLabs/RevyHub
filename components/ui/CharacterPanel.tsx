import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type CharacterTone =
  | "star"
  | "moon"
  | "rocket"
  | "faucet"
  | "detective"
  | "wallet"
  | "trust"
  | "gauge"
  | "lens";

interface CharacterPanelProps {
  tone: CharacterTone;
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}

const toneStyles: Record<CharacterTone, { face: string; hat: string; shadow: string }> = {
  star: { face: "bg-[#fff7b8]", hat: "bg-[#8edcf4]", shadow: "shadow-[7px_7px_0_#ff8b7a]" },
  moon: { face: "bg-[#e9ddff]", hat: "bg-[#7bdcb5]", shadow: "shadow-[7px_7px_0_rgba(111,212,255,0.5)]" },
  rocket: { face: "bg-[#d9f4ff]", hat: "bg-[#ff8b7a]", shadow: "shadow-[7px_7px_0_#ffe2d7]" },
  faucet: { face: "bg-[#dff8ee]", hat: "bg-[#8edcf4]", shadow: "shadow-[7px_7px_0_#ffd66b]" },
  detective: { face: "bg-[#ffe4a8]", hat: "bg-[#5b4b8a]", shadow: "shadow-[7px_7px_0_#c7b9f3]" },
  wallet: { face: "bg-[#e9ddff]", hat: "bg-[#fff7b8]", shadow: "shadow-[7px_7px_0_#8edcf4]" },
  trust: { face: "bg-[#ffd1c6]", hat: "bg-[#fff7b8]", shadow: "shadow-[7px_7px_0_#7bdcb5]" },
  gauge: { face: "bg-[#dff8ee]", hat: "bg-[#ffc3a8]", shadow: "shadow-[7px_7px_0_#8edcf4]" },
  lens: { face: "bg-[#d9f4ff]", hat: "bg-[#ff8b7a]", shadow: "shadow-[7px_7px_0_#c7b9f3]" }
};

export function CharacterPanel({ tone, eyebrow, title, description, children }: CharacterPanelProps) {
  const styles = toneStyles[tone];

  return (
    <div className="grid gap-5 rounded-lg border border-white/85 bg-white/74 p-5 shadow-[0_18px_50px_rgba(84,102,136,0.16)] backdrop-blur-xl sm:grid-cols-[auto_1fr] sm:items-center">
      <div className={cn("relative h-24 w-24 rounded-xl border-4 border-white", styles.face, styles.shadow)}>
        <span className={cn("absolute -top-3 left-5 h-6 w-14 rounded-t-full", styles.hat)} />
        <span className="absolute left-6 top-9 h-3 w-3 rounded-full bg-[#080912]" />
        <span className="absolute right-6 top-9 h-3 w-3 rounded-full bg-[#080912]" />
        <span className="absolute bottom-6 left-1/2 h-4 w-8 -translate-x-1/2 rounded-b-full border-b-4 border-[#080912]" />
        <span className="absolute -right-2 bottom-5 h-6 w-3 rounded-full bg-[#080912]" />
      </div>
      <div>
        <p className="text-xs font-extrabold uppercase tracking-wide text-[#9a6754]">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-black tracking-normal text-[#172033]">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5d6b82]">{description}</p>
        {children ? <div className="mt-4">{children}</div> : null}
      </div>
    </div>
  );
}
