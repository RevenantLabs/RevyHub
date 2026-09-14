/**
 * End-to-end specification for the ScVal Encoder and Decoder tool.
 *
 * Documented as executable steps so the behaviour is reviewable even before a
 * browser runner is wired into CI.
 */
export const spec = {
  route: "/tools/scval-codec",
  steps: [
    { action: "visit", target: "/tools/scval-codec" },
    { action: "expect", target: "heading", value: "ScVal Encoder and Decoder" },
    { action: "fill", target: "ScVal input", value: "AAAAEQAAAAEAAAAPAAAACW5ldHdvcmsAAA==" },
    { action: "click", target: "Convert" },
    { action: "expect", target: "Decoded ScVal", value: '"network"' }
  ]
} as const;
