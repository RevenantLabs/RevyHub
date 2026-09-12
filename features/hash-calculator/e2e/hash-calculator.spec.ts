/**
 * End-to-end specification for the Stellar Hash Calculator tool.
 *
 * Documented as declarative steps describing the complete user journey across
 * raw data SHA-256 hashing, transaction envelope XDR hashing, network passphrase
 * switching, and validation boundaries.
 */
export const spec = {
  route: "/tools/hash-calculator",
  steps: [
    { action: "visit", target: "/tools/hash-calculator" },
    { action: "expect", target: "heading", value: "Stellar Hash Calculator" },
    { action: "expect", target: "text", value: "Nothing calculated yet" },

    { action: "select", target: "Calculator Mode", value: "Raw Data (SHA-256)" },
    { action: "select", target: "Input Encoding", value: "UTF-8" },
    { action: "fill", target: "Data to Hash", value: "hello" },
    { action: "click", target: "Compute Hash" },
    { action: "expect", target: "heading", value: "SHA-256 Hash" },
    { action: "expect", target: "text", value: "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824" },
    { action: "expect", target: "text", value: "LPJNul+wow4m6DsqxbninhsWHlwfp0JecwQzYpOLmCQ=" },
    { action: "click", target: "Copy Hexadecimal digest" },

    { action: "select", target: "Input Encoding", value: "Hexadecimal" },
    { action: "fill", target: "Data to Hash", value: "deadbeef" },
    { action: "click", target: "Compute Hash" },
    { action: "expect", target: "text", value: "5f78c33274e43fa9de5659265c1d917e25c03722dcb0b8d27db8d5feaa813953" },

    { action: "fill", target: "Data to Hash", value: "12345" },
    { action: "click", target: "Compute Hash" },
    { action: "expect", target: "alert", value: "Invalid input encoding" },

    { action: "select", target: "Calculator Mode", value: "Transaction Envelope (XDR)" },
    { action: "select", target: "Network Passphrase", value: "Testnet" },
    {
      action: "fill",
      target: "Transaction Envelope (XDR)",
      value:
        "AAAAAgAAAACKiOPddAnxlf1S2y08ul1yymcJvx2UEhvzdIgBtA9vXAAAAGQAAAAAAAAAZQAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAQAAAACBOXcOqH0XX1ajVGbDTH7My42KkbTuN6Jd9g9bj8mzlAAAAAAAAAAABfXhAAAAAAAAAAAA"
    },
    { action: "click", target: "Compute Hash" },
    { action: "expect", target: "heading", value: "Transaction Hash" },
    { action: "expect", target: "text", value: "7fc5442b19cd03cd23fa6b0525ae00dca11e3fd7c39c668c5f87bd4f9a844c1b" },
    { action: "expect", target: "heading", value: "Passphrase Impact Comparison" },
    { action: "expect", target: "text", value: "f16c5bd8d7ec435e3f2732683875a7df3b15a9a479559caa951c476cc6700537" },

    { action: "click", target: "Switch to Mainnet" },
    { action: "expect", target: "text", value: "f16c5bd8d7ec435e3f2732683875a7df3b15a9a479559caa951c476cc6700537" },

    { action: "fill", target: "Transaction Envelope (XDR)", value: "invalid-xdr" },
    { action: "click", target: "Compute Hash" },
    { action: "expect", target: "alert", value: "Invalid transaction envelope XDR" }
  ]
} as const;
