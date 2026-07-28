"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { StatusMessage } from "@/components/ui/StatusMessage";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  if (process.env.NODE_ENV === "development") {
    console.error("Uncaught rendering error:", error);
  }

  return (
    <div className="mx-auto mt-16 max-w-lg px-4">
      <StatusMessage
        type="error"
        title="Something went wrong"
        description="An unexpected error occurred while loading this page. Please try again or return to the dashboard."
        action={
          <div className="flex flex-wrap gap-3">
            <Button onClick={reset} variant="primary">
              Try again
            </Button>
            <Link href="/">
              <Button variant="secondary">Go to dashboard</Button>
            </Link>
          </div>
        }
      />
    </div>
  );
}