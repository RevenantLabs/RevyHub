import { useRef, useCallback } from "react";

export function useFocusResult() {
  const ref = useRef<HTMLDivElement>(null);

  const moveFocusToResult = useCallback(() => {
    requestAnimationFrame(() => {
      ref.current?.focus({ preventScroll: false });
    });
  }, []);

  return { resultRef: ref, moveFocusToResult };
}
