import { StatusMessage } from "@/core/ui";
import { formatOperationTypeList } from "../lib/format-operations";
import { errorCopy } from "../copy";

/** Shows the no-create-operation outcome, naming the operation types that were actually found. */
export function NoCreateOperationNotice({ operationTypes }: { operationTypes: string[] | undefined }) {
  const { title, description } = errorCopy.no_create_contract_operation;
  return (
    <StatusMessage
      type="error"
      title={title}
      description={`${description} ${formatOperationTypeList(operationTypes ?? [])}`}
    />
  );
}
