export const missingRequired = {
  sender: { USDC: { fields: { email_address: { description: "Email", optional: false } } } }
}

export const emptyRequirements = {
  sender: { USDC: { fields: {} } }
}

export const contradictory = {
  fields: { email_address: { optional: true } },
  required: ["email_address"]
}

export const unsupportedShape = ["email_address"]

export const invalidChoiceMap = {
  bank_country: "ZZ"
}
