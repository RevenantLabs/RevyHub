import type { DecisionNode, Predicate, Verdict } from "@/features/claimable-predicate-evaluator/types";
import { branchDetail } from "@/features/claimable-predicate-evaluator/copy";
export interface TimeContext { evaluationSeconds: bigint; creationSeconds: bigint | null }
function and(a: Verdict, b: Verdict): Verdict { return a === "false" || b === "false" ? "false" : a === "unknown" || b === "unknown" ? "unknown" : "true"; }
function or(a: Verdict, b: Verdict): Verdict { return a === "true" || b === "true" ? "true" : a === "unknown" || b === "unknown" ? "unknown" : "false"; }
export function evaluatePredicate(node: Predicate, context: TimeContext): DecisionNode {
  if (node.kind === "unconditional") return { kind: node.kind, verdict: "true", detail: branchDetail.unconditional };
  if (node.kind === "abs_before") {
    const verdict = context.evaluationSeconds < node.seconds ? "true" : "false";
    return { kind: node.kind, verdict, detail: branchDetail.absolute(node.seconds.toString(), verdict) };
  }
  if (node.kind === "rel_before") {
    if (context.creationSeconds === null) return { kind: node.kind, verdict: "unknown", detail: branchDetail.missingCreation };
    const deadline = context.creationSeconds + node.seconds;
    const verdict = context.evaluationSeconds < deadline ? "true" : "false";
    return { kind: node.kind, verdict, detail: branchDetail.relative(node.seconds.toString(), deadline.toString(), verdict) };
  }
  if (node.kind === "not") {
    const child = evaluatePredicate(node.child, context);
    const verdict = child.verdict === "unknown" ? "unknown" : child.verdict === "true" ? "false" : "true";
    return { kind: node.kind, verdict, detail: branchDetail.not, children: [child] };
  }
  const children = node.children.map((child) => evaluatePredicate(child, context)) as [DecisionNode, DecisionNode];
  const verdict = node.kind === "and" ? and(children[0].verdict, children[1].verdict) : or(children[0].verdict, children[1].verdict);
  return { kind: node.kind, verdict, detail: branchDetail[node.kind], children };
}
