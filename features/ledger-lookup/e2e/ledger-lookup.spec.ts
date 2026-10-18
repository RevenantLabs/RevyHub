export const spec = {route:"/tools/ledger-lookup",steps:[
 {action:"visit",target:"/tools/ledger-lookup"},
 {action:"mock",target:"Horizon root and ledger 900",value:"height=1000, elder=100; successful=4, failed=2"},
 {action:"submit",target:"Ledger sequence",value:"900"},
 {action:"expect",target:"result",value:"UTC close time, relative age, distinct counts and exact XLM/stroop amounts"},
 {action:"edit",target:"Ledger sequence",value:"1001"},
 {action:"expect",target:"previous result",value:"hidden"},
 {action:"submit",target:"form"},
 {action:"expect",target:"alert",value:"current height 1000"},
 {action:"click",target:"Reset"},
 {action:"expect",target:"empty input and idle state"}
]} as const;
