"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

interface RedactionContextValue {
  redacted: boolean;
  setRedacted: (redacted: boolean) => void;
}

const RedactionContext = createContext<RedactionContextValue | null>(null);
const storageKey = "revyhubx-redaction";

function readInitialRedaction(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(storageKey) === "true";
}

export function RedactionProvider({ children }: { children: React.ReactNode }) {
  const [redacted, setRedactedState] = useState<boolean>(readInitialRedaction);

  useEffect(() => {
    window.localStorage.setItem(storageKey, String(redacted));
  }, [redacted]);

  const value = useMemo<RedactionContextValue>(
    () => ({
      redacted,
      setRedacted: setRedactedState
    }),
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
