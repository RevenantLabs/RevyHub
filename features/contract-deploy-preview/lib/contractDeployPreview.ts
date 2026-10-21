import { ok, type Result } from "@/core/result/result";
import { describeConstructorArgs } from "./constructor-args";
import { findCreateContractHostFunction } from "./create-contract-decode";
import { describeExecutable, describePreimageSource } from "./preimage-source";
import type { ContractDeployPreview, ContractDeployPreviewInput, ErrorCode } from "../types";

/**
 * Core tool logic. Decoding is synchronous and local — never throws for
 * expected failures, and never makes a request.
 */
export function previewContractDeploy(
  input: ContractDeployPreviewInput
): Result<ContractDeployPreview, ErrorCode, string[]> {
  const found = findCreateContractHostFunction(input.envelope);
  if (!found.ok) return found;

  const preimage = describePreimageSource(found.value.contractIdPreimage);
  if (!preimage.ok) return preimage;

  const executable = describeExecutable(found.value.executable);
  const constructorArgs = describeConstructorArgs(found.value.constructorArgs);

  return ok({ isV2: found.value.isV2, preimage: preimage.value, executable, constructorArgs });
}
