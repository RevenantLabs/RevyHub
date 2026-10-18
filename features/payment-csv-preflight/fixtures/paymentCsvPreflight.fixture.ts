import { Keypair, StrKey } from "@stellar/stellar-sdk";
import { runPreflight } from "@/features/payment-csv-preflight/lib/paymentCsvPreflight";
import { MAX_ROWS } from "@/features/payment-csv-preflight/schema";
import type { PreflightReport } from "@/features/payment-csv-preflight/types";

/**
 * Deterministic payout data.
 *
 * Every address is derived from a fixed raw seed rather than typed out: a
 * hand-written Stellar address has the wrong checksum, which would make the
 * fixtures fail validation for a reason that has nothing to do with the test.
 */
const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const firstDestination = seed(1).publicKey();
export const secondDestination = seed(2).publicKey();
export const thirdDestination = seed(3).publicKey();

export const issuerA = seed(4).publicKey();
export const issuerB = seed(5).publicKey();

/** Never passed to anything that renders or stores a value. */
export const secretSeed = seed(6).secret();

/** A muxed destination — a different payee than its underlying account. */
export const muxedDestination = StrKey.encodeMed25519PublicKey(
  Buffer.concat([StrKey.decodeEd25519PublicKey(firstDestination), Buffer.alloc(8, 1)])
);

export const truncatedDestination = secondDestination.slice(0, -1);

export const header = "destination,amount,asset_code,asset_issuer,memo_type,memo_value";

/** Three valid rows: lumens, an issued asset, and a muxed destination. */
export const validCsv = [
  header,
  `${firstDestination},10.5,XLM,,text,invoice-1`,
  `${secondDestination},250.0000001,USDC,${issuerA},,`,
  `${muxedDestination},1,XLM,,id,42`
].join("\n");

/** The same code under two different issuers — never totalled together. */
export const sameCodeDifferentIssuerCsv = [
  header,
  `${firstDestination},100,USDC,${issuerA},,`,
  `${secondDestination},100,USDC,${issuerB},,`
].join("\n");

/** Two rows paying the same destination the same asset. */
export const duplicateRowsCsv = [
  header,
  `${firstDestination},10,XLM,,,`,
  `${secondDestination},5,XLM,,,`,
  `${firstDestination},10,XLM,,,`
].join("\n");

/** One row of each failure this tool can attach to a line. */
export const invalidRowsCsv = [
  header,
  `${truncatedDestination},10,XLM,,,`,
  `${firstDestination},0,XLM,,,`,
  `${firstDestination},1.12345678,XLM,,,`,
  `${firstDestination},1e3,XLM,,,`,
  `${firstDestination},10,USDC,,,`,
  `${firstDestination},10,XLM,${issuerA},,`,
  `${firstDestination},10,XLM,,shout,hello`
].join("\n");

/** A secret key where a destination belongs. */
export const secretKeyRowCsv = [header, `${secretSeed},10,XLM,,,`].join("\n");

/** A quoted comma, a doubled quote and a quoted value spanning two lines. */
export const quotedCsv = [
  header,
  `${firstDestination},1000.25,USDC,${issuerA},text,"Invoice 7, part ""two"""`,
  `${secondDestination},2,XLM,,text,"first line`,
  `second line"`
].join("\n");

const BOM = String.fromCharCode(0xfeff);

/** What a spreadsheet writes: a byte-order mark and CRLF line endings. */
export const bomCrlfCsv = `${BOM}${[
  header,
  `${firstDestination},10,XLM,,,`,
  `${secondDestination},20,XLM,,,`
].join("\r\n")}\r\n`;

export const missingHeaderCsv = ["destination,amount,asset_code", `${firstDestination},10,XLM`].join(
  "\n"
);

export const duplicateHeaderCsv = [
  "destination,amount,amount,asset_code,asset_issuer",
  `${firstDestination},10,10,XLM,`
].join("\n");

export const unterminatedQuoteCsv = [header, `${firstDestination},10,XLM,,text,"never closed`].join(
  "\n"
);

export const textAfterQuoteCsv = [header, `${firstDestination},10,XLM,,text,bad"quote"`].join("\n");

export const shortRowCsv = [header, `${firstDestination},10`].join("\n");

/** Built on demand: a 10,001-row string is not worth holding at import time. */
export function oversizedCsv(rows = MAX_ROWS + 1): string {
  return [header, ...Array.from({ length: rows }, () => `${firstDestination},1,XLM,,,`)].join("\n");
}

export const paymentCsvPreflightFixture: PreflightReport = (() => {
  const result = runPreflight({ csv: validCsv });
  if (!result.ok) throw new Error("the valid fixture must produce a report");
  return result.value;
})();
