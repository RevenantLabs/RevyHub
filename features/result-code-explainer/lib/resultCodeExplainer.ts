import { xdr } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import {
  lookupResultCode,
  normalizeResultCode
} from "@/features/result-code-explainer/lib/resultCodes";
import type {
  CodeExplanation,
  OperationResultSummary,
  ResultCodeExplainerErrorCode,
  ResultCodeExplainerInput,
  ResultCodeExplainerResult
} from "@/features/result-code-explainer/types";

/** Converts a Stellar XDR enum arm name to the snake_case codes Horizon prints. */
export function camelToSnake(name: string): string {
  return name
    .replace(/([A-Z])/g, "_$1")
    .toLowerCase()
    .replace(/^_/, "");
}

function readInnerResultCode(tr: xdr.OperationResultTr): string | null {
  const opType = tr.switch().name;
  const accessor = `${opType}Result` as keyof xdr.OperationResultTr;
  const reader = tr[accessor];

  if (typeof reader !== "function") return null;

  try {
    const nested = (reader as () => { switch(): { name: string } }).call(tr);
    if (nested && typeof nested.switch === "function") {
      return camelToSnake(nested.switch().name);
    }
  } catch {
    return null;
  }

  return null;
}

function summarizeOperation(op: xdr.OperationResult, index: number): OperationResultSummary {
  const outerCode = camelToSnake(op.switch().name);

  if (outerCode !== "op_inner") {
    const explanation = lookupResultCode(outerCode);
    return {
      index,
      operationType: null,
      outerCode,
      innerCode: null,
      explanations: [explanation]
    };
  }

  const tr = op.value() as xdr.OperationResultTr;
  const operationType = camelToSnake(tr.switch().name);
  const innerCode = readInnerResultCode(tr);
  const explanations: CodeExplanation[] = [];

  if (innerCode) {
    explanations.push(lookupResultCode(innerCode));
  }

  return { index, operationType, outerCode, innerCode, explanations };
}

/**
 * Decodes a base64 transaction-result XDR entirely in-process.
 *
 * No network request is made and nothing is logged or persisted.
 */
export function decodeResultXdr(
  resultXdr: string
): Result<
  Pick<ResultCodeExplainerResult, "feeCharged" | "transactionCode" | "operations">,
  ResultCodeExplainerErrorCode
> {
  let decoded: xdr.TransactionResult;

  try {
    decoded = xdr.TransactionResult.fromXDR(resultXdr, "base64");
  } catch {
    return err("invalid_xdr");
  }

  try {
    const transactionCode = camelToSnake(decoded.result().switch().name);
    const operations =
      transactionCode === "tx_failed" || transactionCode === "tx_success"
        ? decoded
            .result()
            .results()
            .map((op, index) => summarizeOperation(op, index))
        : [];

    return ok({
      feeCharged: decoded.feeCharged().toString(),
      transactionCode,
      operations
    });
  } catch {
    return err("invalid_xdr");
  }
}

function parseCodeList(raw: string): string[] {
  return raw
    .split(/[\n,;]+/)
    .map((part) => normalizeResultCode(part))
    .filter(Boolean);
}

function explainCodes(codes: string[]): { explanations: CodeExplanation[]; unknownCodes: string[] } {
  const explanations: CodeExplanation[] = [];
  const unknownCodes: string[] = [];
  const seen = new Set<string>();

  for (const code of codes) {
    if (seen.has(code)) continue;
    seen.add(code);

    const explanation = lookupResultCode(code);
    explanations.push(explanation);
    if (!explanation.known) unknownCodes.push(code);
  }

  return { explanations, unknownCodes };
}

function filterBySearch(explanations: CodeExplanation[], search: string): CodeExplanation[] {
  const query = search.trim().toLowerCase();
  if (!query) return explanations;

  return explanations.filter((entry) => {
    const haystack = [
      entry.code,
      entry.title,
      entry.cause,
      entry.fix,
      entry.operationType ?? ""
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
}

function collectExplanations(
  transactionExplanation: CodeExplanation | null,
  operations: OperationResultSummary[]
): CodeExplanation[] {
  const out: CodeExplanation[] = [];
  const seen = new Set<string>();

  function push(entry: CodeExplanation) {
    const key = `${entry.code}:${entry.operationType ?? ""}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(entry);
  }

  if (transactionExplanation) push(transactionExplanation);
  for (const op of operations) {
    for (const entry of op.explanations) push(entry);
  }

  return out;
}

/**
 * Explains result codes from a pasted code list or a decoded result XDR.
 *
 * Never throws for expected failures — returns a Result.
 */
export function explainResultCodes(
  input: ResultCodeExplainerInput
): Result<ResultCodeExplainerResult, ResultCodeExplainerErrorCode> {
  const searchQuery = input.search?.trim() ?? "";

  if (input.mode === "code") {
    const codes = parseCodeList(input.value);

    if (!codes.length) {
      return err("empty_input");
    }

    const { explanations, unknownCodes } = explainCodes(codes);
    const filtered = filterBySearch(explanations, searchQuery);

    if (codes.length === 1 && !lookupResultCode(codes[0]!).known) {
      return err("unknown_code");
    }

    return ok({
      mode: "code",
      feeCharged: null,
      transactionCode: null,
      transactionExplanation: null,
      operations: [],
      explanations: filtered,
      searchQuery,
      unknownCodes
    });
  }

  const decoded = decodeResultXdr(input.value);
  if (!decoded.ok) return decoded;

  const transactionExplanation =
    decoded.value.transactionCode != null
      ? lookupResultCode(decoded.value.transactionCode)
      : null;
  const operations = decoded.value.operations.map((op) => ({
    ...op,
    explanations: filterBySearch(op.explanations, searchQuery)
  }));
  const explanations = filterBySearch(
    collectExplanations(transactionExplanation, decoded.value.operations),
    searchQuery
  );
  const unknownCodes = explanations.filter((entry) => !entry.known).map((entry) => entry.code);

  return ok({
    mode: "xdr",
    feeCharged: decoded.value.feeCharged,
    transactionCode: decoded.value.transactionCode,
    transactionExplanation,
    operations,
    explanations,
    searchQuery,
    unknownCodes
  });
}

/** @deprecated Use explainResultCodes — kept for hook import stability. */
export function runResultCodeExplainer(
  input: ResultCodeExplainerInput
): Result<ResultCodeExplainerResult, ResultCodeExplainerErrorCode> {
  return explainResultCodes(input);
}
