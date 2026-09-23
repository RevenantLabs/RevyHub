import { err, ok, type Result } from "@/core/result/result";
import { normalizeInput } from "@/core/lib/strings";
import type { MultisigAnalyzerErrorCode, MultisigAnalyzerInput } from "@/features/multisig-analyzer/types";

/** Parses raw form input into a validated request, without throwing. */
export function parseMultisigAnalyzerInput(
  raw: Partial<MultisigAnalyzerInput> | string
): Result<MultisigAnalyzerInput, MultisigAnalyzerErrorCode> {
  const envelope = normalizeInput(typeof raw === "string" ? raw : raw.envelope ?? "");
  const sourceAccount = normalizeInput(typeof raw === "string" ? raw : raw.sourceAccount ?? "");

  if (!envelope || !sourceAccount) return err("empty_input");
  if (sourceAccount.startsWith("S")) return err("empty_input");

  return ok({ envelope, sourceAccount });
}
