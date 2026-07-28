"use client";

import { createContext, useContext, useMemo, useState } from "react";

interface RedactionContextValue {
  redacted: boolean;
  setRedacted: (value: boolean) => void;
}

const RedactionContext = createContext<RedactionContextValue | null>(null);

export function RedactionProvider({ children }: { children: React.ReactNode }) {
  const [redacted, setRedacted] = useState(false);

  const value = useMemo<RedactionContextValue>(
    () => ({ redacted, setRedacted }),
    [redacted]
  );

  return <RedactionContext.Provider value={value}>{children}</RedactionContext.Provider>;
}

export function useRedaction() {
  const value = useContext(RedactionContext);

  if (!value) {
    throw new Error("useRedaction must be used within RedactionProvider.");
  }

  return value;
}
