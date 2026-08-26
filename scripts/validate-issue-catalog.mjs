#!/usr/bin/env node

import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { catalog, categoryLabels } from "./issue-catalog.mjs";
import { grantfoxConfig } from "./grantfox-config.mjs";
import {
  advancedWaveSlugs,
  isImplemented,
  issueTier,
  orderForPublication
} from "./issue-status.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MINIMUM_PUBLISHABLE_ISSUES = 40;
const REQUIRED_ADVANCED_WAVE_SIZE = 20;
const difficulties = new Set(["medium", "advanced"]);

function fail(message) {
  throw new Error(`[issue-catalog] ${message}`);
}

function requireText(tool, field) {
  if (typeof tool[field] !== "string" || !tool[field].trim()) {
    fail(`${tool.slug || "<unknown>"}: ${field} must be non-empty text`);
  }
}

export function validateCatalog() {
  for (const field of ["projectId", "repositoryId", "campaignId", "campaignName"]) {
    if (typeof grantfoxConfig[field] !== "string" || !grantfoxConfig[field].trim()) {
      fail(`GrantFox ${field} must be configured`);
    }
  }
  if (
    grantfoxConfig.requiredLabels.length !== 3 ||
    !grantfoxConfig.requiredLabels.includes("GrantFox OSS") ||
    !grantfoxConfig.requiredLabels.includes("Maybe Rewarded") ||
    !grantfoxConfig.requiredLabels.includes(grantfoxConfig.campaignName)
  ) {
    fail("GrantFox labels must include GrantFox OSS, Maybe Rewarded and the active campaign name");
  }

  const slugs = new Set();
  const titles = new Set();

  for (const tool of catalog) {
    for (const field of [
      "slug",
      "title",
      "category",
      "difficulty",
      "summary",
      "why",
      "source",
      "notes",
      "reference"
    ]) {
      requireText(tool, field);
    }

    if (!/^[a-z][a-z0-9-]*$/.test(tool.slug)) {
      fail(`${tool.slug}: slug must be kebab-case`);
    }
    if (slugs.has(tool.slug)) fail(`${tool.slug}: duplicate slug`);
    if (titles.has(tool.title)) fail(`${tool.slug}: duplicate title "${tool.title}"`);
    slugs.add(tool.slug);
    titles.add(tool.title);

    if (!(tool.category in categoryLabels)) {
      fail(`${tool.slug}: unknown category "${tool.category}"`);
    }
    if (!difficulties.has(tool.difficulty)) {
      fail(`${tool.slug}: difficulty must be medium or advanced`);
    }
    if (!Array.isArray(tool.criteria) || tool.criteria.length < 5) {
      fail(`${tool.slug}: at least five acceptance criteria are required`);
    }
    if (!Array.isArray(tool.outOfScope) || tool.outOfScope.length < 2) {
      fail(`${tool.slug}: at least two out-of-scope boundaries are required`);
    }
    if (!Array.isArray(tool.codes) || tool.codes.length === 0) {
      fail(`${tool.slug}: at least one actionable error code is required`);
    }

    const codes = new Set();
    for (const entry of tool.codes) {
      if (!Array.isArray(entry) || entry.length !== 2 || !entry.every(Boolean)) {
        fail(`${tool.slug}: every error-code entry must contain code and condition`);
      }
      if (codes.has(entry[0])) fail(`${tool.slug}: duplicate error code "${entry[0]}"`);
      codes.add(entry[0]);
    }

    if (!existsSync(path.join(root, tool.reference))) {
      fail(`${tool.slug}: reference implementation "${tool.reference}" does not exist`);
    }
  }

  if (advancedWaveSlugs.length !== REQUIRED_ADVANCED_WAVE_SIZE) {
    fail(
      `advanced wave must contain exactly ${REQUIRED_ADVANCED_WAVE_SIZE} issues ` +
        `(found ${advancedWaveSlugs.length})`
    );
  }
  if (new Set(advancedWaveSlugs).size !== advancedWaveSlugs.length) {
    fail("advanced wave contains duplicate slugs");
  }

  const bySlug = new Map(catalog.map((tool) => [tool.slug, tool]));
  for (const slug of advancedWaveSlugs) {
    const tool = bySlug.get(slug);
    if (!tool) fail(`advanced wave references unknown slug "${slug}"`);
    if (isImplemented(root, tool)) {
      fail(`advanced wave issue "${slug}" is already implemented`);
    }
    if (issueTier(tool).difficulty !== "advanced") {
      fail(`advanced wave issue "${slug}" is not labelled advanced`);
    }
  }

  const publishable = orderForPublication(
    catalog.filter((tool) => !isImplemented(root, tool))
  );
  if (publishable.length < MINIMUM_PUBLISHABLE_ISSUES) {
    fail(
      `only ${publishable.length} independent issues remain; ` +
        `${MINIMUM_PUBLISHABLE_ISSUES} are required`
    );
  }

  const firstWave = publishable.slice(0, REQUIRED_ADVANCED_WAVE_SIZE).map((tool) => tool.slug);
  if (firstWave.some((slug, index) => slug !== advancedWaveSlugs[index])) {
    fail("the first twenty publishable issues do not match the advanced wave order");
  }

  for (const tool of publishable.slice(REQUIRED_ADVANCED_WAVE_SIZE)) {
    if (issueTier(tool).difficulty !== "medium") {
      fail(`post-wave issue "${tool.slug}" must be labelled medium`);
    }
  }

  return {
    total: catalog.length,
    publishable: publishable.length,
    advanced: advancedWaveSlugs.length
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const result = validateCatalog();
    console.log(
      `[issue-catalog] OK: ${result.total} detailed tools, ` +
        `${result.publishable} currently publishable, ` +
        `${result.advanced} in the first advanced wave`
    );
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
