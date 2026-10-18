import { copy } from "../copy";
import { formatDeadline } from "../lib/format";
import type { PredicateNode } from "../types";
export function PredicateDetails({ node }: { node: PredicateNode }) {
  if ("children" in node) return <div className="ml-3 border-l pl-3"><strong>{copy[node.kind]}</strong><ul className="list-disc pl-5">{node.children.map((child, index) => <li key={index}><PredicateDetails node={child} /></li>)}</ul></div>;
  if ("child" in node) return <div className="ml-3 border-l pl-3"><strong>{copy.not}</strong><PredicateDetails node={node.child} /></div>;
  if (node.kind === "unconditional") return <span>{copy.unconditional}</span>;
  if (node.kind === "rel_before" || node.kind === "rel_after") return <span>{copy[node.kind]}: {node.value}{!node.instant ? ` — ${copy.unknownCreation}` : ` — ${formatDeadline(node.instant)}`}</span>;
  return <span>{copy[node.kind]}: {formatDeadline(node.value)}</span>;
}
