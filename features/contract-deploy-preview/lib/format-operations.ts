/** Formats the list of operation types found when no create-contract host function was among them. */
export function formatOperationTypeList(operationTypes: string[]): string {
  if (operationTypes.length === 0) return "This envelope has no operations at all.";
  return `This envelope contains: ${operationTypes.join(", ")}.`;
}
