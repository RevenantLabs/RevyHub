import { codeMeanings, conditionMeanings, copy } from "../copy";
import type { ExplainedCode } from "../types";

/** Humanize protocol enum names while preserving the exact code for debugging. */
export function formatCode(code: string): string { return code.replace(/^tx_|^op_/, "").replace(/_/g, " "); }
export function formatOperation(index: number, type: string): string { return `${index + 1}. ${type.replace(/_/g, " ")}`; }
export function formatFee(stroops: string): string { return `${stroops} ${copy.feeUnit}`; }
export function explainCode(code: string, type?: string): ExplainedCode {
  const title = formatCode(code);
  let explanation = codeMeanings[code];
  if (!explanation && (code === "op_success" || code.endsWith("_success"))) explanation = copy.genericSuccess;
  if (!explanation && !code.startsWith("tx_")) {
    const condition = Object.keys(conditionMeanings).sort((a, b) => b.length - a.length).find((key) => code.endsWith(`_${key}`));
    if (condition) explanation = copy.explainCondition(type ?? copy.operationName, conditionMeanings[condition]);
  }
  return { code, title, explanation: explanation ?? (code.startsWith("tx_") ? copy.unknownTransactionCode : copy.explainUnknownOperation(type ?? copy.operationName, title)) };
}
