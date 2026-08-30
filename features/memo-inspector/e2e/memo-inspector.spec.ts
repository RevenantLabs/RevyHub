/**
 * End-to-end specification for the memo encoder.
 *
 * Declarative on purpose: the repository has no browser runner yet, so the
 * steps describe the journey a runner should drive, in the same shape every
 * other slice uses.
 */
export const spec = {
  route: "/tools/memo-inspector",
  steps: [
    { action: "visit", target: "/tools/memo-inspector" },
    { action: "expect", target: "heading", value: "Memo Encoder and Decoder" },

    // Text: the byte counter moves while typing, and emoji cost four bytes each.
    { action: "select", target: "Memo type", value: "Text (MEMO_TEXT)" },
    { action: "fill", target: "Memo text", value: "Invoice 1001" },
    { action: "expect", target: "text", value: "12 / 28 bytes" },
    { action: "click", target: "Encode memo" },
    { action: "expect", target: "text", value: "AAAAAQAAAAxJbnZvaWNlIDEwMDE=" },

    // The 28 bytes are a byte budget, not a character budget.
    { action: "fill", target: "Memo text", value: "🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀" },
    { action: "expect", target: "text", value: "40 / 28 bytes — 12 over" },
    { action: "click", target: "Encode memo" },
    { action: "expect", target: "alert", value: "The text memo is over 28 bytes" },

    // Id: an unsigned 64-bit integer, checked at the top of its range.
    { action: "select", target: "Memo type", value: "ID (MEMO_ID)" },
    { action: "fill", target: "Memo ID", value: "18446744073709551616" },
    { action: "click", target: "Encode memo" },
    { action: "expect", target: "alert", value: "That is not a valid memo ID" },
    { action: "fill", target: "Memo ID", value: "18446744073709551615" },
    { action: "click", target: "Encode memo" },
    { action: "expect", target: "text", value: "AAAAAv//////////" },

    // Hash: 32 bytes, from hex or from base64.
    { action: "select", target: "Memo type", value: "Hash (MEMO_HASH)" },
    { action: "fill", target: "Hash", value: "<64 hex characters>" },
    { action: "click", target: "Encode memo" },
    { action: "expect", target: "text", value: "Byte layout" },
    { action: "expect", target: "text", value: "36 bytes" },

    // None: no value asked for, four bytes encoded.
    { action: "select", target: "Memo type", value: "None (MEMO_NONE)" },
    { action: "expect", target: "no-field", value: "Memo text" },
    { action: "click", target: "Encode memo" },
    { action: "expect", target: "text", value: "AAAAAA==" },

    // Both sides of the tool are copyable.
    { action: "click", target: "Copy Base64" },
    { action: "expect", target: "status", value: "Base64 copied to clipboard" }
  ]
} as const;
