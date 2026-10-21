import { MEMO_REQUIRED_KEY, MEMO_REQUIRED_VALUE } from "@/features/memo-required-checker/lib/memo-required-flag";

export const requiredFlag = {
  [MEMO_REQUIRED_KEY]: btoa(MEMO_REQUIRED_VALUE)
};

export const malformedFlag = {
  [MEMO_REQUIRED_KEY]: btoa("memo")
};

export const unrelatedData = {
  "config.other": btoa("hello")
};
