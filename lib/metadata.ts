import type { Metadata } from "next";
import { tools } from "@/lib/constants";

const PROJECT_NAME = "RevyHubX";

export function createToolMetadata(href: string): Metadata {
  const tool = tools.find((candidate) => candidate.href === href);

  if (!tool) {
    throw new Error(`Missing tool metadata for ${href}`);
  }

  return {
    title: `${tool.title} | ${PROJECT_NAME}`,
    description: tool.description,
    openGraph: {
      title: `${tool.title} | ${PROJECT_NAME}`,
      description: tool.description
    }
  };
}
