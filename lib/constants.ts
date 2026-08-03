/**
 * @deprecated Import from @/lib/registry instead.
 * This module re-exports from the tool registry for backward compatibility.
 */
export {
  tools,
  type Tool,
  type ToolStatus,
  type ToolCategory,
  type ToolCategoryInfo,
  statusTone,
  toolCategories,
  getToolByHref,
  getAllToolRoutes,
  getDuplicateRoutes
} from "./registry";
import { Landmark } from "lucide-react";

export const projectLinks = [
  {
    title: "GrantFox-ready MVP",
    description: "Built for a focused open-source Stellar project application.",
    icon: Landmark
  }
];
