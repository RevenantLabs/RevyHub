"use client";

import { WifiOff } from "lucide-react";
import { useOnline } from "@/lib/useOnline";

interface OfflineBannerProps {
  message?: string;
  className?: string;
}

export function OfflineBanner({
  message = "You're offline. Network-backed tools require an internet connection.",
  className = ""
}: OfflineBannerProps) {
  const isOnline = useOnline();

  if (isOnline) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`flex items-center gap-3 rounded-lg border border-[#ff8b7a]/60 bg-[#fff7f1] px-4 py-3 text-sm text-[#8a5a4c] shadow-[3px_3px_0_rgba(255,139,122,0.28)] ${className}`}
    >
      <WifiOff className="h-5 w-5 shrink-0 text-[#ff8b7a]" aria-hidden />
      <span className="font-semibold">{message}</span>
    </div>
  );
}
