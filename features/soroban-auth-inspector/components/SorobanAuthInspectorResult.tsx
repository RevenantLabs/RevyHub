"use client";

import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { CopyableValue } from "@/core/ui/CopyableValue";
import { copy } from "@/features/soroban-auth-inspector/copy";
import type {
  AuthCredentials,
  AuthEntry,
  AuthInvocationNode,
  SorobanAuthInspectorResult as SorobanAuthInspectorResultValue
} from "@/features/soroban-auth-inspector/types";

function Credentials({ credentials }: { credentials: AuthCredentials }) {
  if (credentials.kind === "sourceAccount") {
    return <p className="text-sm text-[#4e5c73]">{copy.sourceAccountCredentials}</p>;
  }

  return (
    <div className="space-y-1 text-sm">
      <p className="text-[#4e5c73]">{copy.addressCredentials}</p>
      {credentials.accountId ? (
        <CopyableValue label={copy.accountLabel} value={credentials.accountId} visible={6} />
      ) : credentials.contractId ? (
        <CopyableValue label={copy.contractLabel} value={credentials.contractId} visible={6} />
      ) : (
        <p className="text-[#8a98aa]">{copy.unknownSigner}</p>
      )}
      <p className="text-[#68758a]">
        {copy.nonceLabel}: {credentials.nonce}
      </p>
      <p className="text-[#68758a]">
        {copy.signatureExpirationLedgerLabel}: {credentials.signatureExpirationLedger}
      </p>
    </div>
  );
}

function InvocationNode({
  node,
  depth = 0,
  isSubInvocation = false
}: {
  node: AuthInvocationNode;
  depth?: number;
  isSubInvocation?: boolean;
}) {
  return (
    <li
      className="space-y-2 border-l-2 border-[#e3ebf5] pl-3"
      style={{ marginLeft: `${depth * 12}px` }}
    >
      {isSubInvocation ? (
        <p className="text-xs font-semibold text-[#ff8b7a]">{copy.suspiciousSubInvocation}</p>
      ) : null}

      {node.contractId ? (
        <CopyableValue label={copy.contractLabel} value={node.contractId} visible={6} />
      ) : null}

      <p className="text-sm text-[#172033]">
        <span className="font-semibold">{copy.functionLabel}:</span> {node.functionName}
      </p>

      <div className="text-sm">
        <span className="font-semibold text-[#4e5c73]">{copy.argsLabel}:</span>{" "}
        {node.args.length ? (
          <ul className="mt-1 space-y-1">
            {node.args.map((arg, index) => (
              <li key={index}>
                <CopyableValue label={`Arg ${index + 1}`} value={arg} visible={6} />
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-[#8a98aa]">{copy.noArgs}</span>
        )}
      </div>

      {node.subInvocations.length ? (
        <div className="text-sm">
          <p className="font-semibold text-[#4e5c73]">{copy.subInvocationsLabel}</p>
          <ul className="mt-1 space-y-2">
            {node.subInvocations.map((sub, index) => (
              <InvocationNode key={index} node={sub} depth={depth + 1} isSubInvocation />
            ))}
          </ul>
        </div>
      ) : null}
    </li>
  );
}

function AuthEntryResult({ entry, index }: { entry: AuthEntry; index: number }) {
  return (
    <section className="space-y-3 rounded-md border border-[#e3ebf5] bg-[#f8fafc] p-4">
      <h3 className="text-sm font-bold text-[#172033]">
        {copy.entryTitle} {index + 1}
      </h3>

      <div>
        <h4 className="mb-1 text-xs font-bold uppercase tracking-wide text-[#4e5c73]">
          {copy.credentialsTitle}
        </h4>
        <Credentials credentials={entry.credentials} />
      </div>

      <div>
        <h4 className="mb-1 text-xs font-bold uppercase tracking-wide text-[#4e5c73]">
          {copy.invocationTreeTitle}
        </h4>
        <ul>
          <InvocationNode node={entry.rootInvocation} />
        </ul>
      </div>
    </section>
  );
}

function NoAuthorizationResult() {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-[#172033]">{copy.noAuthorizationTitle}</p>
      <p className="text-sm text-[#4e5c73]">{copy.noAuthorizationDescription}</p>
    </div>
  );
}

export function SorobanAuthInspectorResult({
  result
}: {
  result: SorobanAuthInspectorResultValue;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.resultTitle}</CardTitle>
      </CardHeader>

      {result.kind === "no_authorization" ? (
        <NoAuthorizationResult />
      ) : (
        <div className="space-y-4">
          {result.entries.map((entry, index) => (
            <AuthEntryResult key={index} entry={entry} index={index} />
          ))}
        </div>
      )}
    </Card>
  );
}
