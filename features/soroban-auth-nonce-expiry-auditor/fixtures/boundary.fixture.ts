import { accountA, accountB, addressEntry, sourceEntry } from "./normal.fixture";
/** Equal nonces on separate accounts are not reuse; source identity is unresolved. */
export const separateAccountsBundle = [addressEntry(accountA, "7", 100), addressEntry(accountB, "7", 99), sourceEntry].join("\n");
export const malformedBundle = "AAAA";
