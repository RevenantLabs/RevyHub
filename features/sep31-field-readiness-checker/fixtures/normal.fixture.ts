export const ANCHOR_ID = "anchor-demo"
export const ASSET_CODE = "USDC"
export const EMAIL = "payer@example.com"

export const requirementsRecord = {
  sender: {
    USDC: {
      fields: {
        email_address: { description: "Email", optional: false },
        bank_country: { description: "Country", optional: false, choices: ["US", "DE"] }
      }
    }
  },
  receiver: {
    USDC: {
      fields: {
        email_address: { description: "Email", optional: true }
      }
    }
  }
}

export const fieldMapRecord = {
  email_address: EMAIL,
  bank_country: "US"
}

export function requirementsJson(value: unknown = requirementsRecord) {
  return JSON.stringify(value)
}

export function fieldMapJson(value: unknown = fieldMapRecord) {
  return JSON.stringify(value)
}
