/** Reviewable browser specification; the repository does not configure an E2E runner. */
export const spec={route:"/tools/strkey-inspector",steps:[
 {action:"visit",target:"/tools/strkey-inspector"},{action:"submit",target:"empty form"},{action:"expect",target:"actionable validation error"},
 {action:"fill",target:"form",value:"deterministic sample from this slice's fixture"},{action:"click",target:"Analyze"},
 {action:"expect",target:"StrKey Type Inspector result and exact copyable values; zero network requests"},
 {action:"edit",target:"input"},{action:"expect",target:"old result hidden"},{action:"click",target:"Reset"},{action:"expect",target:"idle state and cleared inputs"}
 ]} as const;
