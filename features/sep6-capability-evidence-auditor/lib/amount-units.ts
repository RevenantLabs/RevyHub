const AMOUNT = /^(0|[1-9][0-9]*)(\.[0-9]+)?$/

export function isDecimalString(value: string): boolean {
  return AMOUNT.test(value)
}

/** Compares two exact decimal strings. Returns null when either is not a decimal. */
export function compareDecimals(left: string, right: string): -1 | 0 | 1 | null {
  if (!isDecimalString(left) || !isDecimalString(right)) return null
  const [leftWhole, leftFrac = ""] = left.split(".")
  const [rightWhole, rightFrac = ""] = right.split(".")
  const scale = Math.max(leftFrac.length, rightFrac.length)
  const leftScaled = BigInt(leftWhole + leftFrac.padEnd(scale, "0"))
  const rightScaled = BigInt(rightWhole + rightFrac.padEnd(scale, "0"))
  if (leftScaled < rightScaled) return -1
  if (leftScaled > rightScaled) return 1
  return 0
}

export function amountRange(minAmount: string | null, maxAmount: string | null): "comparable" | "incompatible" | "absent" {
  if (minAmount === null || maxAmount === null) return "absent"
  const order = compareDecimals(minAmount, maxAmount)
  if (order === null || order > 0) return "incompatible"
  return "comparable"
}
