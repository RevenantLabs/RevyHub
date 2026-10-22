import { err, ok, type Result } from "@/core/result/result";
import type { AssetIdentity, PathPaymentRecord, PathPaymentSlippageCalculatorErrorCode } from "@/features/path-payment-slippage-calculator/types";
interface HorizonOperation { type?: string; dest_min?: string; send_max?: string; amount?: string; source_amount?: string; destination_asset_type?: string; destination_asset_code?: string; destination_asset_issuer?: string; source_asset_type?: string; source_asset_code?: string; source_asset_issuer?: string; path?: Array<Record<string, string>> }
function asset(type = "", code = "", issuer?: string): AssetIdentity { return type === "native" ? { type: "native", code: "XLM", issuer: null } : { type, code, issuer: issuer ?? null }; }
export function extractPathPayment(records: HorizonOperation[]): Result<PathPaymentRecord, PathPaymentSlippageCalculatorErrorCode> {
  const operation = records.find((item) => item.type === "path_payment_strict_send" || item.type === "path_payment_strict_receive");
  if (!operation) return err("no_path_payment_operation");
  const strictSend = operation.type === "path_payment_strict_send";
  const declared = strictSend ? operation.dest_min : operation.send_max;
  const actual = strictSend ? operation.amount : operation.source_amount;
  if (!declared || !actual) return err("malformed_effect");
  return ok({
    variant: strictSend ? "strict-send" : "strict-receive", declaredBound: declared, actualAmount: actual,
    boundAsset: strictSend
      ? asset(operation.destination_asset_type, operation.destination_asset_code, operation.destination_asset_issuer)
      : asset(operation.source_asset_type, operation.source_asset_code, operation.source_asset_issuer),
    path: (operation.path ?? []).map((item) => asset(item.asset_type, item.asset_code, item.asset_issuer))
  });
}
