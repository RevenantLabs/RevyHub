/**
 * A small, bounded CSV reader.
 *
 * Written here rather than pulled in as a dependency because the slice must
 * not touch the package manifest, and because the rules a payout file needs
 * are narrow and worth being explicit about: RFC 4180 quoting, doubled quotes
 * as an escape, CRLF or LF, and an optional byte-order mark.
 */

export interface CsvRow {
  /** 1-based line number where this record *started*. */
  line: number;
  fields: string[];
}

export type CsvResult =
  | { ok: true; rows: CsvRow[] }
  | { ok: false; line: number; reason: "unterminated_quote" | "text_after_quote" };

/**
 * U+FEFF, built from its code point.
 *
 * A literal BOM in source is invisible — impossible to review, and easy for an
 * editor to strip without anyone noticing the parser stopped handling it.
 */
const BOM = String.fromCharCode(0xfeff);

/**
 * Parses CSV text into records.
 *
 * A quoted field may contain commas, newlines and doubled quotes; the line
 * number reported for a record is where it *began*, so a multi-line quoted
 * value still points at something the user can find in their editor.
 */
export function parseCsv(text: string): CsvResult {
  // Excel writes a BOM; leaving it in makes the first header name unmatchable.
  const input = text.startsWith(BOM) ? text.slice(1) : text;

  const rows: CsvRow[] = [];
  let fields: string[] = [];
  let field = "";
  let inQuotes = false;
  let line = 1;
  let recordLine = 1;
  let sawField = false;

  const endField = () => {
    fields.push(field);
    field = "";
    sawField = true;
  };

  const endRecord = () => {
    endField();
    rows.push({ line: recordLine, fields });
    fields = [];
    sawField = false;
    recordLine = line + 1;
  };

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];

    if (inQuotes) {
      if (character === '"') {
        if (input[index + 1] === '"') {
          field += '"';
          index += 1;
          continue;
        }
        inQuotes = false;
        continue;
      }
      if (character === "\n") line += 1;
      field += character;
      continue;
    }

    if (character === '"') {
      // A quote may only open a field, never appear part-way through one.
      if (field.length > 0) return { ok: false, line: recordLine, reason: "text_after_quote" };
      inQuotes = true;
      continue;
    }

    if (character === ",") {
      endField();
      continue;
    }

    if (character === "\r") {
      // Swallow CR so CRLF behaves exactly like LF.
      if (input[index + 1] === "\n") continue;
      endRecord();
      line += 1;
      continue;
    }

    if (character === "\n") {
      endRecord();
      line += 1;
      continue;
    }

    field += character;
  }

  if (inQuotes) return { ok: false, line: recordLine, reason: "unterminated_quote" };

  // A trailing newline leaves nothing pending; anything else is a final record.
  if (field.length > 0 || sawField || fields.length > 0) endRecord();

  return { ok: true, rows };
}

/** Drops records that are entirely empty, which trailing blank lines produce. */
export function withoutBlankRows(rows: CsvRow[]): CsvRow[] {
  return rows.filter((row) => row.fields.some((value) => value.trim() !== ""));
}
