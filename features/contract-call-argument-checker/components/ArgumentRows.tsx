import { copy } from "../copy";

export function ArgumentRows({ expected, actual }: { expected: string[]; actual: string[] }) {
  const count = Math.max(expected.length, actual.length);
  if (!count) return <p>{copy.noMismatches}</p>;
  return (
    <ol>
      {Array.from({ length: count }, (_, index) => (
        <li key={index}>Expected {expected[index] ?? "none"}; actual {actual[index] ?? "none"}</li>
      ))}
    </ol>
  );
}
