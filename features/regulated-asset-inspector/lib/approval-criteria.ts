export interface ApprovalEvidence {
  approvalServer: string | null;
  approvalCriteria: string | null;
}

/** Trim publisher text and drop empty values so the UI can say "not declared". */
export function normalizeApproval(input: {
  approvalServer?: string;
  approvalCriteria?: string;
}): ApprovalEvidence {
  const server = input.approvalServer?.trim() ?? "";
  const criteria = input.approvalCriteria?.trim() ?? "";
  return {
    approvalServer: server.length > 0 ? server : null,
    approvalCriteria: criteria.length > 0 ? criteria : null
  };
}
