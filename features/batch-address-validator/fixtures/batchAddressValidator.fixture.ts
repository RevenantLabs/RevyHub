import {
  secondPublicKey,
  secretSeed,
  truncatedPublicKey,
  validPublicKey
} from "@/features/address-validator/fixtures/addressValidator.fixture";
import { runBatchAddressValidator } from "@/features/batch-address-validator/lib/batchAddressValidator";
import type { BatchAddressValidatorResult } from "@/features/batch-address-validator/types";

export const mixedAddressList = [validPublicKey, secondPublicKey, truncatedPublicKey, validPublicKey];

export const batchAddressValidatorFixture: BatchAddressValidatorResult = runBatchAddressValidator({
  lines: mixedAddressList
});

export const secretSeedList = [validPublicKey, secretSeed];

export const commaSeparatedInput = `${validPublicKey}, ${secondPublicKey}`;
export const spaceSeparatedInput = `${validPublicKey} ${secondPublicKey}`;
export const newlineSeparatedInput = `${validPublicKey}\n${secondPublicKey}`;

export { secretSeed };
