import type { DecisionNode } from "@/features/claimable-predicate-evaluator/types";
import { copy } from "@/features/claimable-predicate-evaluator/copy";
import { formatVerdict } from "@/features/claimable-predicate-evaluator/lib/format";
function Branch({ node }: { node: DecisionNode }) {
  return <li className="rounded-md border border-[#c7d6e8] p-3">
    <p className="font-semibold">{copy.kindNames[node.kind]}: {formatVerdict(node.verdict)}</p>
    <p className="text-sm">{node.detail}</p>
    {node.children?.length ? <ul className="mt-2 ml-4 space-y-2 border-l pl-3">{node.children.map((child, index) => <Branch key={index} node={child} />)}</ul> : null}
  </li>;
}
export function PredicateDecisionTree({ tree }: { tree: DecisionNode }) { return <section aria-label={copy.treeTitle}><h3 className="mb-2 font-bold">{copy.treeTitle}</h3><ul><Branch node={tree} /></ul></section>; }
