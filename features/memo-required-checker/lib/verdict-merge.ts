import type { MemoSignal, MemoSource } from "@/features/memo-required-checker/types";

export interface MergedVerdict {
  verdict: "required" | "not_required";
  sources: MemoSource[];
  conflict: boolean;
}

/** Either requiring source is enough. Neither signal is an explicit not-required verdict. */
export function mergeVerdict(dataEntry: MemoSignal, toml: MemoSignal): MergedVerdict {
  const sources: MemoSource[] = [];
  if (dataEntry === "required") sources.push("data_entry");
  if (toml === "required") sources.push("stellar_toml");

  return {
    verdict: sources.length > 0 ? "required" : "not_required",
    sources,
    conflict: dataEntry === "required" && toml === "not_required"
  };
}
