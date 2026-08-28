export const copy = {
  title: "Sponsored Reserves Inspector",
  description: "Check which of an account's subentries are sponsored and by whom, and which reserves the account is sponsoring for others.",
  formLabel: "Account ID",
  formHint: "The Stellar account to inspect.",
  submit: "Inspect Reserves",
  loading: "Loading sponsored reserves...",
  result: {
    sponsoredByOthers: "Subentries Sponsored By Others",
    sponsoringForOthers: "Reserves Sponsoring For Others",
    noneSponsored: "This account does not have any subentries sponsored by others.",
    noneSponsoring: "This account is not sponsoring any reserves for others.",
    sponsorColumn: "Sponsor",
    typeColumn: "Type",
    detailsColumn: "Details",
    accountSponsoredColumn: "Account Sponsored"
  }
};

export const errorCopy = {
  empty_input: {
    title: "Input required",
    description: "Please enter an account ID."
  },
  invalid_address: {
    title: "Invalid address",
    description: "The account ID must be a valid public key (starting with G). Secret keys are not allowed."
  },
  account_not_found: {
    title: "Account not found",
    description: "The account was not found on the selected network."
  },
  rate_limited: {
    title: "Rate limited",
    description: "The network is too busy. Please try again in a moment."
  },
  request_failed: {
    title: "Request failed",
    description: "The request failed. Please check your connection and try again."
  }
};
