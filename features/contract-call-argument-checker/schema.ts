import { err, ok, type Result } from "@/core/result/result";
import type { ErrorCode, RawInput } from "./types";
import type { CheckerInput } from "./lib/contractCallArgumentChecker";

const SECRET = /^S[A-Z2-7]{55}$/;

export function parseInput(raw: RawInput): Result<CheckerInput, ErrorCode> {
  const spec = raw.spec ?? "";
  const functionName = (raw.functionName ?? "").trim();
  const argumentsXdr = raw.arguments ?? "";
  if (SECRET.test(spec.trim())) return err("invalid_spec_xdr");
  if (SECRET.test(argumentsXdr.trim()) || argumentsXdr.split(/\n/).some((line) => SECRET.test(line.trim()))) {
    return err("invalid_arg_xdr");
  }
  if (!functionName) return err("unknown_function");
  if (!spec.trim()) return err("invalid_spec_xdr");
  return ok({ spec, functionName, argumentsXdr });
}
