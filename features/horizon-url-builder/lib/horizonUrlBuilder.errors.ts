import type { HorizonUrlErrorCode } from "@/features/horizon-url-builder/types";

export function isHorizonUrlError(e: unknown): boolean {
  return typeof e === "object" && e !== null && "code" in e;
}
