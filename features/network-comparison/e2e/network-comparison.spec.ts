/** Browser scenario specification; no E2E runner is configured by the repository. */
export const spec={route:"/tools/network-comparison",steps:[
 {action:"visit",target:"/tools/network-comparison"},
 {action:"mock",target:"both roots and latest ledgers",value:"different protocol versions and independent heights"},
 {action:"click",target:"Compare networks"},{action:"expect",target:"side-by-side columns and highlighted protocol difference"},
 {action:"switch",target:"header network"},{action:"expect",target:"comparison unchanged"},
 {action:"mock",target:"mainnet",value:"503"},{action:"click",target:"Compare networks"},
 {action:"expect",target:"testnet retained, mainnet failure, partial advice"},
 {action:"click",target:"Reset"},{action:"expect",target:"idle state"}
]} as const;
