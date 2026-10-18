import { Badge } from "@/core/ui/Badge";
import { branchOutcomeLabel, copy } from "@/features/claimable-balance-readiness/copy";
import type { BranchOutcome, PredicateTreeNode } from "@/features/claimable-balance-readiness/types";

function toneFor(outcome: BranchOutcome): "success" | "danger" | "warning" {
  if (outcome === "satisfied") return "success";
  if (outcome === "unsatisfied") return "danger";
  return "warning";
}

function PredicateBranch({ node, depth }: { node: PredicateTreeNode; depth: number }) {
  const headingId = `predicate-branch-${depth}-${node.kind}-${node.outcome}`;

  return (
    <li className="rounded-md border border-[#e3ebf5] bg-white/60 px-3 py-3 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={toneFor(node.outcome)}>{branchOutcomeLabel(node.outcome)}</Badge>
        <span className="font-semibold text-[#172033]" id={headingId}>
          {node.label}
        </span>
      </div>
      <p className="mt-2 text-[#4e5c73]" aria-describedby={headingId}>
        {node.explanation}
      </p>
      {node.children?.length ? (
        <ul className="mt-3 space-y-2 border-l-2 border-[#e3ebf5] pl-3" aria-label={node.label}>
          {node.children.map((child, index) => (
            <PredicateBranch
              key={`${child.kind}-${index}-${child.outcome}`}
              node={child}
              depth={depth + 1}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

/** Nested branch-by-branch predicate decisions for screen readers and sighted users. */
export function PredicateTree({ tree }: { tree: PredicateTreeNode }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-extrabold uppercase tracking-wide text-[#4e5c73]">
        {copy.predicateTreeTitle}
      </h3>
      <ul className="space-y-2" aria-label={copy.predicateTreeTitle}>
        <PredicateBranch node={tree} depth={0} />
      </ul>
    </div>
  );
}
