import { describe, expect, it } from "vitest";
import { parseCsv, withoutBlankRows } from "@/features/payment-csv-preflight/lib/csv";

function fields(text: string) {
  const result = parseCsv(text);
  if (!result.ok) throw new Error(`expected a parse, got ${result.reason}`);
  return result.rows.map((row) => row.fields);
}

describe("parseCsv", () => {
  it("splits a simple record", () => {
    expect(fields("a,b,c")).toEqual([["a", "b", "c"]]);
  });

  it("keeps a comma inside a quoted field", () => {
    expect(fields('a,"b,c",d')).toEqual([["a", "b,c", "d"]]);
  });

  it("reads a doubled quote as one literal quote", () => {
    expect(fields('a,"say ""hi""",b')).toEqual([["a", 'say "hi"', "b"]]);
  });

  it("keeps a newline inside a quoted field", () => {
    expect(fields('a,"one\ntwo"')).toEqual([["a", "one\ntwo"]]);
  });

  it("treats CRLF exactly like LF", () => {
    expect(fields("a,b\r\nc,d")).toEqual([
      ["a", "b"],
      ["c", "d"]
    ]);
  });

  it("treats a lone CR as a line break", () => {
    expect(fields("a,b\rc,d")).toEqual([
      ["a", "b"],
      ["c", "d"]
    ]);
  });

  it("strips a leading byte-order mark", () => {
    expect(fields(`${String.fromCharCode(0xfeff)}a,b`)).toEqual([["a", "b"]]);
  });

  it("keeps empty fields, including a trailing one", () => {
    expect(fields("a,,c,")).toEqual([["a", "", "c", ""]]);
  });

  it("reports the line a record started on for an unterminated quote", () => {
    expect(parseCsv('a,b\nc,"open\nstill open')).toEqual({
      ok: false,
      line: 2,
      reason: "unterminated_quote"
    });
  });

  it("rejects a quote that opens part-way through a field", () => {
    expect(parseCsv('a,b"c"')).toEqual({ ok: false, line: 1, reason: "text_after_quote" });
  });

  it("does not invent a record after a trailing newline", () => {
    expect(fields("a,b\n")).toEqual([["a", "b"]]);
  });

  it("counts lines through a multiline quoted value", () => {
    const result = parseCsv('a,"one\ntwo"\nb,c');
    expect(result.ok && result.rows.map((row) => row.line)).toEqual([1, 3]);
  });
});

describe("withoutBlankRows", () => {
  it("drops records that hold nothing but whitespace", () => {
    const rows = [
      { line: 1, fields: ["a", "b"] },
      { line: 2, fields: [""] },
      { line: 3, fields: [" ", "\t"] }
    ];

    expect(withoutBlankRows(rows)).toEqual([{ line: 1, fields: ["a", "b"] }]);
  });
});
