/** Reviewable browser specification; the repository does not configure an E2E runner. */
export const spec={route:"/tools/ledger-range-planner",steps:[
 {action:"visit",target:"/tools/ledger-range-planner"},{action:"submit",target:"empty form"},{action:"expect",target:"actionable validation error"},
 {action:"fill",target:"form",value:"deterministic sample from this slice's fixture"},{action:"click",target:"Analyze"},
 {action:"expect",target:"Ledger Range and Retention Planner result and exact copyable values; zero network requests"},
 {action:"edit",target:"input"},{action:"expect",target:"old result hidden"},{action:"click",target:"Reset"},{action:"expect",target:"idle state and cleared inputs"}
 ]} as const;
