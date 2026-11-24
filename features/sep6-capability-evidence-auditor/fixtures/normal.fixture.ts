export const ANCHOR_URL = "https://anchor.example"

export const infoRecord = {
  deposit: {
    USD: {
      enabled: true,
      authentication_required: true,
      min_amount: "1.00",
      max_amount: "1000.00",
      fee_fixed: "0.10",
      fee_percent: "0.01"
    }
  },
  withdraw: {
    USD: {
      enabled: false,
      min_amount: "5.00",
      max_amount: "500.00"
    }
  }
}

export function infoJson(value: unknown = infoRecord) {
  return JSON.stringify(value)
}
