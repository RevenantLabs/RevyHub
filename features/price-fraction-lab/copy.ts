import type { ErrorCode } from "./types";
export const copy = {
  "title": "Stellar Price Fraction Workbench",
  "description": "Convert positive decimal prices or exact fractions to Stellar Price bounds. Decimal previews truncate toward zero at your selected precision; an unrepresentable exact price is rejected.",
  "submit": "Analyze",
  "loading": "Analyzing…",
  "reset": "Reset",
  "emptyTitle": "Ready to inspect",
  "emptyDescription": "Convert positive decimal prices or exact fractions to Stellar Price bounds. Decimal previews truncate toward zero at your selected precision; an unrepresentable exact price is rejected.",
  "resultTitle": "Analysis result",
  "report": "Local JSON report",
  "noRows": "No matching rows",
  "all": "All rows",
  "filter": "Filter results",
  "rejected": "Sensitive input discarded. Enter only public data.",
  "fields": {
    "mode": {
      "label": "Input mode",
      "hint": "Use a decimal or numerator/denominator pair.",
      "options": [
        "Decimal",
        "Fraction"
      ],
      "default": "Decimal"
    },
    "decimal": {
      "label": "Decimal price",
      "hint": "Positive plain decimal, at most 100 characters; no exponent notation."
    },
    "numerator": {
      "label": "Numerator",
      "hint": "Fraction mode: positive integer, at most 100 digits."
    },
    "denominator": {
      "label": "Denominator",
      "hint": "Fraction mode: positive integer; zero is invalid."
    },
    "precision": {
      "label": "Preview precision",
      "hint": "0–18 digits after the decimal; truncation toward zero.",
      "default": "7"
    }
  },
  "labels": {
    "numerator": "Reduced numerator",
    "denominator": "Reduced denominator",
    "decimal": "Decimal preview (truncated toward zero)",
    "inverseNumerator": "Inverse numerator",
    "inverseDenominator": "Inverse denominator",
    "inverseDecimal": "Inverse decimal preview",
    "error": "Signed exact rational error"
  }
} as const;
export const errorCopy: Record<ErrorCode,{title:string;description:string}> = {
  "empty_input": {
    "title": "Empty input",
    "description": "Enter a price in the selected mode."
  },
  "invalid_input": {
    "title": "Invalid input",
    "description": "Use positive decimal/integer syntax without signs or exponents and precision from 0 to 18."
  },
  "input_too_large": {
    "title": "Input too large",
    "description": "Keep each numeric input within 100 characters."
  },
  "out_of_range": {
    "title": "Out of range",
    "description": "The reduced exact numerator or denominator exceeds 2147483647. Choose an exactly representable price; this tool does not silently approximate."
  },
  "zero_denominator": {
    "title": "Zero denominator",
    "description": "Use a nonzero positive denominator."
  }
};
