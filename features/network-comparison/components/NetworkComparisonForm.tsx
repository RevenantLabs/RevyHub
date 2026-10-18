"use client";
import { Button } from "@/core/ui/Button";
import { copy } from "../copy";
export function NetworkComparisonForm({onSubmit, pending}: {onSubmit: () => void; pending: boolean}) {
  return <form onSubmit={e => {e.preventDefault(); onSubmit();}} className="space-y-4">
    <p>{copy.formHint}</p><Button type="submit" disabled={pending}>{pending ? copy.loading : copy.submit}</Button>
  </form>;
}
