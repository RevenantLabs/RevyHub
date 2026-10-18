import { copy } from "../copy";
import type { Verdict } from "../types";

export function RuleVerdicts({ verdicts }: { verdicts: Verdict[] }) {
  return (
    <section>
      <h3>{copy.verdictsTitle}</h3>
      <ul>
        {verdicts.map((item) => (
          <li key={item.field}>
            {item.field}: {item.passed ? "pass" : "fail"}. {item.advice}
          </li>
        ))}
      </ul>
    </section>
  );
}
