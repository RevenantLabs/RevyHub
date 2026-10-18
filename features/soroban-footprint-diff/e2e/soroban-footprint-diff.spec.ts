import {
  firstSimulationJson,
  secondSimulationJson
} from "@/features/soroban-footprint-diff/fixtures/sorobanFootprintDiff.fixture";

export const spec = {
  route: "/tools/soroban-footprint-diff",
  steps: [
    { action: "visit", target: "/tools/soroban-footprint-diff" },
    { action: "expect", target: "heading", value: "Soroban Footprint Difference Inspector" },
    { action: "expect", target: "text", value: "No footprint comparison yet" },
    { action: "fill", target: "First simulation result JSON", value: firstSimulationJson },
    { action: "fill", target: "Second simulation result JSON", value: secondSimulationJson },
    { action: "click", target: "Compare footprints" },
    { action: "expect", target: "text", value: "Access mode changes" }
  ]
} as const;
