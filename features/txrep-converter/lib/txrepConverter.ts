import { err, ok, type Result } from "@/core/result/result";
import { detectFormat } from "@/features/txrep-converter/lib/format-detect";
import { convertTxrepToXdr } from "@/features/txrep-converter/lib/txrep-to-xdr";
import { sameEnvelopeBytes } from "@/features/txrep-converter/lib/txrep-tree";
import { convertXdrToTxrep } from "@/features/txrep-converter/lib/xdr-to-txrep";
import type {
  TxrepConverterErrorCode,
  TxrepConverterInput,
  TxrepConverterResult
} from "@/features/txrep-converter/types";

export function runTxrepConverter(
  input: TxrepConverterInput
): Result<TxrepConverterResult, TxrepConverterErrorCode> {
  const detected = detectFormat(input.value);
  if (detected === "xdr") return fromXdr(input.value);
  if (detected === "txrep") return fromTxrep(input.value);
  return err(input.value.includes(":") ? "invalid_txrep" : "invalid_xdr");
}

function fromXdr(raw: string): Result<TxrepConverterResult, TxrepConverterErrorCode> {
  const txrep = convertXdrToTxrep(raw);
  if (!txrep.ok) return err(txrep.code);
  const back = convertTxrepToXdr(txrep.value);
  return ok({
    detected: "xdr",
    output: txrep.value,
    outputFormat: "txrep",
    fieldCount: countFields(txrep.value),
    roundTripMatched: back.ok && sameEnvelopeBytes(raw, back.value)
  });
}

function fromTxrep(raw: string): Result<TxrepConverterResult, TxrepConverterErrorCode> {
  const xdrText = convertTxrepToXdr(raw);
  if (!xdrText.ok) return err(xdrText.code);
  const back = convertXdrToTxrep(xdrText.value);
  const again = back.ok ? convertTxrepToXdr(back.value) : null;
  return ok({
    detected: "txrep",
    output: xdrText.value,
    outputFormat: "xdr",
    fieldCount: back.ok ? countFields(back.value) : 0,
    roundTripMatched: Boolean(again?.ok && sameEnvelopeBytes(xdrText.value, again.value))
  });
}

function countFields(txrep: string): number {
  return txrep.split(/\r?\n/).filter((line) => line.includes(":") && !line.trim().startsWith(":")).length;
}
