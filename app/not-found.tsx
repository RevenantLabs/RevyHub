import Link from "next/link";
import { Compass } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";

export default function NotFound() {
  return (
    <div className="py-16">
      <EmptyState
        icon={Compass}
        title="This page drifted out of orbit"
        description="The tool you asked for is not part of RevyHubX. Head back to the dashboard to see everything that is available."
        action={
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-md border border-black/10 bg-[#ff8b7a] px-4 py-2 text-sm font-extrabold text-white shadow-[4px_4px_0_#9bdcc8] transition hover:bg-[#ff765f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#47a8c7] focus-visible:ring-offset-2"
          >
            Back to all tools
          </Link>
        }
      />
    </div>
  );
}
