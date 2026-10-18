export const spec = {
  route: "/tools/manage-data-codec",
  steps: [
    { action: "visit", target: "/tools/manage-data-codec" },
    { action: "expect", target: "heading", value: "Manage-Data Payload Encoding Workbench" },
    { action: "expect", target: "text", value: "Nothing encoded yet" },

    // A plain UTF-8 entry.
    { action: "fill", target: "Entry name", value: "config.version" },
    { action: "fill", target: "Entry value", value: "1.4.0" },
    { action: "click", target: "Build operation" },
    { action: "expect", target: "text", value: "Operation XDR" },
    { action: "expect", target: "text", value: "Decoded back from the XDR" },
    { action: "expect", target: "text", value: "Yes — a value is set" },
    { action: "expect", target: "button", value: "Copy operation XDR" },

    // A zero-byte value is a set, not a delete.
    { action: "fill", target: "Entry value", value: "" },
    { action: "click", target: "Build operation" },
    { action: "expect", target: "status", value: "This sets a zero-byte value" },

    // Deleting hides the value inputs and produces different bytes.
    { action: "select", target: "Mode", value: "Delete the entry" },
    { action: "expectNotVisible", target: "field", value: "Entry value" },
    { action: "click", target: "Build operation" },
    { action: "expect", target: "status", value: "This is a deletion" },
    { action: "expect", target: "text", value: "No — the entry is deleted" },

    // Binary values render as hex only.
    { action: "select", target: "Mode", value: "Set a value" },
    { action: "select", target: "Value encoding", value: "Hex" },
    { action: "fill", target: "Entry value", value: "fffefdfc" },
    { action: "click", target: "Build operation" },
    { action: "expect", target: "text", value: "ff fe fd fc" },
    { action: "expect", target: "text", value: "Not shown — see hex" },

    // A multibyte name over 64 bytes is refused by byte count, not by characters.
    { action: "fill", target: "Entry name", value: "<64 two-byte characters>" },
    { action: "click", target: "Build operation" },
    { action: "expect", target: "alert", value: "The name is over 64 bytes" },

    // A secret key is refused outright and cleared.
    { action: "fill", target: "Entry value", value: "<ed25519 secret seed>" },
    { action: "click", target: "Build operation" },
    { action: "expect", target: "alert", value: "That input cannot be used" },
    { action: "expectNotVisible", target: "text", value: "<ed25519 secret seed>" },

    { action: "expectNoRequest", target: "network" }
  ]
} as const;
