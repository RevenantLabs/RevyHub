export const disabledAsset = {
  deposit: { USD: { enabled: false } }
}

export const missingFee = {
  deposit: { USD: { enabled: true, min_amount: "1", max_amount: "2" } }
}

export const incompatibleRange = {
  withdraw: { USD: { enabled: true, min_amount: "10", max_amount: "1" } }
}

export const unknownField = {
  deposit: { USD: { enabled: true, extra_desk: "night" } }
}

export const malformedRecord = {
  "deposit-exchange": { USD: "yes" }
}

export const authRequired = {
  withdraw: { EUR: { enabled: true, authentication_required: true, fee_percent: "1.5" } }
}
