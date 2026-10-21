import { TransactionVerdict } from "./TransactionVerdict";
import { OperationResultRows } from "./OperationResultRows";
import { FeeBumpUnwrapNotice } from "./FeeBumpUnwrapNotice";
import type { OperationResultXdrDecoderResult as Result } from "../types";
export function OperationResultXdrDecoderResult({ result }: { result: Result }) {
  return <div className="space-y-4"><TransactionVerdict result={result} /><FeeBumpUnwrapNotice result={result} /><OperationResultRows operations={result.operations} /></div>;
}
