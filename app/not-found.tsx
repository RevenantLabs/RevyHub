import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { CharacterPanel } from "@/components/ui/CharacterPanel";
import { Button } from "@/components/ui/Button";
import { ToolCard } from "@/components/ui/ToolCard";
import { tools } from "@/lib/constants";

export default function NotFound() {
  // Recommend core Stellar tools for easy navigation
  const coreTools = tools.slice(0, 3);

  return (
    <div className="space-y-10">
      <CharacterPanel
        tone="detective"
        eyebrow="404 - Route Not Found"
        title="Our Stellar helper couldn't find this page."
        description="The route you requested seems to have drifted into deep space or does not exist on RevyHubX. Don't worry—our helper cast can guide you safely back to the main dashboard or to one of our working Stellar utilities."
      >
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/" aria-label="Return to RevyHubX main dashboard">
            <Button variant="primary">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </CharacterPanel>

      <section aria-labelledby="featured-tools-heading" className="space-y-4">
        <div className="flex items-center gap-2">
          <Compass className="h-5 w-5 text-[#178fb5]" aria-hidden="true" />
          <h2 id="featured-tools-heading" className="text-xl font-bold text-[#172033]">
            Or explore these core Stellar tools:
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {coreTools.map((tool) => (
            <ToolCard key={tool.href} {...tool} />
          ))}
        </div>
      </section>
    </div>
  );
}
