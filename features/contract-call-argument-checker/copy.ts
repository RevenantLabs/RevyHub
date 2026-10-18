import type { ErrorCode } from "./types";

export const copy = {
  title: "Contract Call Argument Checker",
  description:
    "Compare pasted Soroban arguments with one function in a contract spec. The check is structural and happens entirely in this browser.",
  submit: "Check arguments",
  loading: "Checking arguments…",
  reset: "Reset",
  emptyTitle: "Paste a spec to begin",
  emptyDescription: "Provide newline-separated ScSpecEntry XDR, pick a function, then paste one ScVal XDR per argument. Nothing is stored or sent.",
  resultTitle: "Argument check",
  picker: "Functions in this spec",
  mismatchTitle: "Type mismatches",
  noMismatches: "Every argument matches the selected function.",
  rejected: "Secret keys are discarded and never shown.",
  fields: {
    spec: {
      label: "Contract spec XDR",
      hint: "One base64 ScSpecEntry per line. Maximum 80000 characters.",
      multiline: true
    },
    functionName: {
      label: "Function name",
      hint: "Must be one of the function entries in the spec."
    },
    arguments: {
      label: "Argument XDR",
      hint: "One base64 ScVal per line, in specification order.",
      multiline: true
    }
  }
} as const;

export const errorCopy: Record<ErrorCode, { title: string; description: string }> = {
  invalid_spec_xdr: {
    title: "Invalid spec XDR",
    description: "Paste canonical base64 ScSpecEntry values, one function or struct per line, with no trailing bytes."
  },
  unknown_function: {
    title: "Unknown function",
    description: "Choose a function name that appears in the pasted spec."
  },
  invalid_arg_xdr: {
    title: "Invalid argument XDR",
    description: "Paste canonical base64 ScVal values, one argument per line, with no trailing bytes."
  },
  argument_count_mismatch: {
    title: "Argument count does not match",
    description: "Supply one ScVal line for every input of the selected function, in order."
  },
  unsupported_spec_type: {
    title: "Unsupported spec type",
    description: "Remove result types or unnamed structs. This checker covers bool, numeric, address, option, vec, map and named structs."
  },
  too_large: {
    title: "XDR is too large",
    description: "Shorten the pasted spec or arguments to 80000 characters or fewer and try again."
  }
};
