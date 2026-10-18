import { copy } from "../copy";
import type { HashReport } from "../types";

export function HashComparison({ report }: { report: HashReport }) {
  return (
    <section>
      <p>{copy.verdicts[report.verdict]}</p>
      <p>{report.atomic ? copy.atomic : copy.notAtomic}</p>
    </section>
  );
}
