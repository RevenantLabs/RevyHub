/**
 * End-to-end specification for the Contract Upgrade Compatibility Diff Report.
 *
 * Documented as executable steps so the journey is reviewable even before a
 * browser runner is wired into CI. File values refer to the fixtures in
 * `fixtures/normal.fixture.ts` and `fixtures/boundary.fixture.ts`.
 */
export const spec = {
  route: "/tools/contract-upgrade-diff-report",
  steps: [
    { action: "visit", target: "/tools/contract-upgrade-diff-report" },
    { action: "expect", target: "heading", value: "Contract Upgrade Compatibility Diff Report" },
    { action: "expect", target: "text", value: "No binaries compared yet" },

    // Nothing selected: one alert, pointing at the old file.
    { action: "click", target: "Compare Wasm files" },
    { action: "expect", target: "alert", value: "Old file: Choose two Wasm files" },

    // The normal upgrade.
    { action: "upload", target: "Current (old) Wasm", value: "<oldWasm>" },
    { action: "upload", target: "Upgrade (new) Wasm", value: "<newWasm>" },
    { action: "click", target: "Compare Wasm files" },
    { action: "expect", target: "status", value: "Declared interface changes may break existing callers" },
    { action: "expect", target: "text", value: "legacy_mint" },
    { action: "expect", target: "text", value: "Result<(), TokenError>" },
    { action: "expect", target: "text", value: "Protocol 22" },
    { action: "expect", target: "text", value: "No evidence gaps" },

    // Incomplete evidence: the old binary has no contractspecv0.
    { action: "upload", target: "Current (old) Wasm", value: "<noSpecWasm>" },
    { action: "click", target: "Compare Wasm files" },
    { action: "expect", target: "status", value: "Evidence is incomplete" },
    { action: "expectNotVisible", target: "text", value: "Removed" },

    // Malformed framing on the new side.
    { action: "upload", target: "Upgrade (new) Wasm", value: "<notWasmBytes>" },
    { action: "click", target: "Compare Wasm files" },
    { action: "expect", target: "alert", value: "New file: That file is not a readable Wasm module" },

    // Over the 1 MiB bound.
    { action: "upload", target: "Upgrade (new) Wasm", value: "<overMaxWasm>" },
    { action: "click", target: "Compare Wasm files" },
    { action: "expect", target: "alert", value: "New file: That file is larger than 1 MiB" },

    { action: "click", target: "Clear" },
    { action: "expect", target: "text", value: "No binaries compared yet" },
    { action: "expectNoRequest", target: "network" }
  ]
} as const;
