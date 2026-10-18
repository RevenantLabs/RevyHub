import { err, ok, type Result } from "@/core/result/result";
import type { ErrorCode, RawInput } from "./types";

const SECRET = /^S[A-Z2-7]{55}$/;

export function parseInput(raw: RawInput): Result<{ uri: string; policy: string }, ErrorCode> {
  const uri = raw.uri ?? "";
  const policy = raw.policy ?? "";
  if (SECRET.test(uri.trim()) || uri.split(/[?&]/).some((part) => SECRET.test(part.trim()))) return err("invalid_uri");
  if (!uri.trim()) return err("invalid_uri");
  if (!policy.trim()) return err("invalid_policy");
  return ok({ uri, policy });
}
