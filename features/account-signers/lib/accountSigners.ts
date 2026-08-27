import { err, ok, type Result } from "@/core/result/result";
import { horizonServer } from "@/core/horizon/client";
import type { StellarNetwork } from "@/core/network/types";
import { toAccountSignersErrorCode } from "@/features/account-signers/lib/accountSigners.errors";
import type {
  AccountSigner,
  AccountSignersErrorCode,
  AccountSignersInput,
  AccountSignersResult,
  AccountThresholds,
  SignerType,
  ThresholdAssessment,
  ThresholdLevel
} from "@/features/account-signers/types";

interface HorizonSigner {
  key: string;
  weight: number | string;
  type: SignerType;
}

interface HorizonThresholds {
  low_threshold: number | string;
  med_threshold: number | string;
  high_threshold: number | string;
}

export function normalizeSigner(signer: HorizonSigner, accountId: string): AccountSigner {
  return {
    key: signer.key,
    weight: String(signer.weight),
    type: signer.type,
    isMaster: signer.type === "ed25519_public_key" && signer.key === accountId
  };
}

/** Adds integer signer weights without floating-point conversion. */
export function totalSignerWeight(signers: Pick<AccountSigner, "weight">[]): string {
  return signers.reduce((total, signer) => total + BigInt(signer.weight), 0n).toString();
}

export function normalizeThresholds(thresholds: HorizonThresholds): AccountThresholds {
  return {
    low: String(thresholds.low_threshold),
    medium: String(thresholds.med_threshold),
    high: String(thresholds.high_threshold)
  };
}

export function assessThresholds(
  thresholds: AccountThresholds,
  availableWeight: string
): ThresholdAssessment[] {
  const levels: ThresholdLevel[] = ["low", "medium", "high"];
  const total = BigInt(availableWeight);

  return levels.map((level) => ({
    level,
    requiredWeight: thresholds[level],
    availableWeight,
    canBeMet: total >= BigInt(thresholds[level])
  }));
}

export function isNormalSingleSignerAccount(
  signers: AccountSigner[],
  thresholds: AccountThresholds
): boolean {
  return (
    signers.length === 1 &&
    signers[0].isMaster &&
    signers[0].weight === "1" &&
    thresholds.low === "0" &&
    thresholds.medium === "0" &&
    thresholds.high === "0"
  );
}

export async function loadAccountSigners(
  { accountId }: AccountSignersInput,
  network: StellarNetwork
): Promise<Result<AccountSignersResult, AccountSignersErrorCode>> {
  try {
    const account = await horizonServer(network).loadAccount(accountId);
    const signers = account.signers.map((signer) =>
      normalizeSigner(signer as HorizonSigner, account.accountId())
    );
    const thresholds = normalizeThresholds(account.thresholds);
    const totalWeight = totalSignerWeight(signers);

    return ok({
      accountId: account.accountId(),
      signers,
      thresholds,
      thresholdAssessments: assessThresholds(thresholds, totalWeight),
      totalWeight,
      isNormalSingleSigner: isNormalSingleSignerAccount(signers, thresholds),
      isMultisig: signers.length > 1,
      masterKeyDisabled: signers.some((signer) => signer.isMaster && signer.weight === "0")
    });
  } catch (error) {
    return err(toAccountSignersErrorCode(error));
  }
}
