"use client";

import { useCallback, useState } from "react";
import { isErr } from "@/core/result/result";
import { FIELD_OF_CODE, parsePaymentRequest, type RawPaymentForm } from "@/features/payment-qr/schema";
import { buildPaymentUri } from "@/features/payment-qr/lib/paymentUri";
import { renderQrSvg } from "@/features/payment-qr/lib/qrCode";
import { toPaymentQrErrorCode } from "@/features/payment-qr/lib/paymentQr.errors";
import type {
  PaymentQrErrorCode,
  PaymentQrField,
  PaymentRequest,
  PaymentUriResult
} from "@/features/payment-qr/types";

export type PaymentQrState =
  | { status: "idle" }
  | { status: "generating" }
  | { status: "success"; request: PaymentRequest; result: PaymentUriResult }
  | { status: "error"; code: PaymentQrErrorCode; field: PaymentQrField | null };

export function usePaymentQr() {
  const [state, setState] = useState<PaymentQrState>({ status: "idle" });

  const submit = useCallback(async (raw: RawPaymentForm) => {
    const parsed = parsePaymentRequest(raw);

    if (isErr(parsed)) {
      setState({ status: "error", code: parsed.code, field: FIELD_OF_CODE[parsed.code] });
      return;
    }

    setState({ status: "generating" });
    const uri = buildPaymentUri(parsed.value);

    try {
      const svg = await renderQrSvg(uri);
      setState({ status: "success", request: parsed.value, result: { uri, svg } });
    } catch (error) {
      const code = toPaymentQrErrorCode(error);
      setState({ status: "error", code, field: FIELD_OF_CODE[code] });
    }
  }, []);

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, submit, reset };
}
