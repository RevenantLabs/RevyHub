export const regulatedCurrency = {
  code: "USDC",
  regulated: true,
  approvalServer: " https://issuer.example/approve ",
  approvalCriteria: "  KYC required  ",
  regulatedFieldPresent: true
};

export const currencyMissingRegulated = {
  code: "USDC",
  regulatedFieldPresent: false
};
