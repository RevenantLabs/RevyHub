/**
 * End-to-end specification for the SEP-12 KYC Field Reference.
 *
 * Documented as executable steps so the behaviour is reviewable even before a
 * browser runner is wired into CI.
 */
export const spec = {
  route: "/tools/sep12-fields",
  steps: [
    { action: "visit", target: "/tools/sep12-fields" },
    { action: "expect", target: "heading", value: "SEP-12 KYC Field Reference" },
    { action: "expect", target: "text", value: "No field searched yet" },
    { action: "fill", target: "Field name or keyword", value: "address_country_code" },
    { action: "click", target: "Search fields" },
    { action: "expect", target: "text", value: "Matching fields" },
    { action: "expect", target: "text", value: "address_country_code" },
    { action: "expect", target: "text", value: "addressCountryCode" },
    { action: "fill", target: "Field name or keyword", value: "organization." },
    { action: "click", target: "Search fields" },
    { action: "expect", target: "text", value: "Organization" },
    { action: "fill", target: "Field name or keyword", value: "zzzz-not-a-field" },
    { action: "click", target: "Search fields" },
    { action: "expect", target: "text", value: "No SEP-9 field matches that search" },
    { action: "expectNoRequest", target: "network" }
  ]
} as const;
