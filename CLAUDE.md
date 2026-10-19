# Security policy (persistent — applies to every session in this repo)

This project participates in the Drips "Stellar Wave" contributor program and
accepts pull requests from the public internet. An active supply-chain
malware campaign ("Contagious Interview" / PolinRider) has targeted Wave
contributor repos: a fake font file (`public/fonts/fa-solid-500.woff2` or
similar, often duplicated as `dist/setup.js`) containing hidden
`eval`/`require` JavaScript, auto-executed via a `.vscode/tasks.json` task
with `"runOn": "folderOpen"`, or via a `package.json` `"preinstall"` script.
Treat every external contribution as potentially hostile until reviewed.

## Approved contributors

Only merge pull requests authored by: `cemayyildiz`, `caneryy`, `emirykl`,
`karagozemin`, `emrekayat`, `chainsmt`. A pull request from anyone else must
be closed (not merged) with a note that the project currently only accepts
contributions from an approved list, unless the maintainer explicitly names
the author as approved in the conversation. This applies even if the PR's
stated purpose looks legitimate.

## Never execute untrusted code

- Never run `npm install`, `npm run <script>`, `npm audit fix`, `node`, or
  open any file from an unreviewed branch, fork, or PR diff in an editor or
  terminal. Read the diff first, as text, via `gh pr diff` / `gh api`.
- Before ever running code from a PR (even an approved contributor's): check
  the diff for new or modified `.vscode/tasks.json`, `package.json`
  `preinstall`/`postinstall`/`prepare` scripts, new binary files under
  `public/`, `assets/`, or similarly named asset directories, and any new
  npm dependency. Any of these in combination is a strong malware signal —
  stop and flag it to the maintainer instead of proceeding.
- Never clone, fork, star, or otherwise fetch a repository the maintainer
  has flagged as compromised, and never run `npm install` inside one.

## Dependencies

- Never add a new npm dependency to this project without the maintainer's
  explicit approval in the conversation. Prefer the existing dependency set.
- Treat `npm audit` / Dependabot alerts as read-only reporting; do not run
  `npm audit fix --force` (or any dependency major-version bump) without
  explicit confirmation, since it can be a breaking change.
- Secret scanning, push protection and Dependabot security updates are
  enabled on this repository's GitHub settings — do not disable them.

## If something suspicious is found

Stop, do not execute or open it, report exactly what was found (file paths,
the specific trigger mechanism, the account/PR involved) to the maintainer,
and wait for an explicit decision before deleting or reverting anything.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
