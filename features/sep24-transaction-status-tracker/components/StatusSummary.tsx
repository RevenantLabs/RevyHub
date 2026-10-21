export function StatusSummary({ status, explanation }: { status: string; explanation: string }) {
  return (
    <p>
      <span className="font-mono text-sm font-medium">{status}</span>
      <span className="mt-1 block text-sm text-white/70">{explanation}</span>
    </p>
  );
}
