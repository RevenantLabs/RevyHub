import { err, ok, type Result } from "@/core/result/result";
import type { ErrorCode, RawInput } from "./types";
import { isContractId } from "./lib/contract-instance";

const SECRET = /^S[A-Z2-7]{55}$/;

export function parseInput(raw: RawInput): Result<{ contractId: string }, ErrorCode> {
  const contractId = (raw.contractId ?? "").trim();
  if (SECRET.test(contractId) || contractId.startsWith("S")) return err("invalid_contract_id");
  if (!isContractId(contractId)) return err("invalid_contract_id");
  return ok({ contractId });
}
