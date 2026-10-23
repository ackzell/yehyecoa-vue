# Agent Instructions for yehyecoa-vue

## Project overview

Collaborative Vue REPL used standalone and embedded as the playground template
inside amoxtli-vue. pnpm workspace: root app plus `packages/party-kit`,
`packages/playground-layout`, `packages/shared-types`, and `packages/vue-repl`.

See `.github/copilot-instructions.md` for the full architecture and code style,
and `docs/` for project screenshots.

## Committing (conventional commits)

All commits must follow the conventional commits format: `<type>(<scope>): <subject>`.

Use the opencode `/commit` command to stage and commit the work produced in the
current session (it applies the rules below and asks when in doubt).

### Scopes

The scope list below mirrors `conventionalCommits.scopes` in
`.vscode/settings.json` (used by the VSCode "Conventional Commits" extension).
Keep both in sync when changing it.

| scope | use for | code areas |
| --- | --- | --- |
| `release` | version bumps only; produced by `pnpm tag` / `tag:minor` / `tag:major` (commit-and-tag-version), never hand-written | CHANGELOG.md, `package.json` version |
| `deps` | add/upgrade/remove dependencies, workspace links, dependency patches | `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `packages/*/package.json` |
| `repl` | REPL shell, editor, preview, console, layout, bundled REPL package | `src/components/YvRepl.vue`, `src/components/YvSidebar/`, `packages/vue-repl/` |
| `sync` | instructor/attendee collaboration and state synchronization | `src/composables/useReplSync.ts`, `src/composables/usePartyKitStore.ts`, `src/composables/useFileManagerStore.ts` |
| `party-kit` | realtime server implementation | `packages/party-kit/` |
| `playground-layout` | dock layout and file tree package | `packages/playground-layout/` |
| `shared-types` | cross-package message and file types | `packages/shared-types/` |
| `lesson` | lesson file loading, SSE bridge, standalone server | `server.js`, `src/lib/`, lesson-related plumbing |
| `versioning` | snapshots, history drawer, session restore | `src/components/YvVersioningDrawer/`, `src/db/` |
| `ui` | app chrome: header, footer, toasts, dialogs, theme | `src/components/YvHeader/`, `src/components/YvFooter.vue`, `src/components/toasts/`, `src/components/ui/` |
| `a11y` | broad cross-cutting accessibility passes only; per-component fixes use that component's scope | any |
| `changelog` | in-app changelog sheet and its parser | `src/components/YvChangelogSheet.vue`, `src/lib/changelog/` |
| `dev` | build/tooling/dev-experience (build config, lint, tsconfig, scripts) | `vite.config.ts`, `eslint.config.ts`, `uno.config.ts`, `scripts/`, `.vscode/` |
| `ci` | CI and release config | `.github/workflows/` |
| `docs` | documentation, README, screenshots | `README.md`, `docs/` |

### Types

- `feat` / `fix` -- user-visible behavior changes
- `refactor` -- internal restructuring with no behavior change
- `chore` -- build, tooling, housekeeping
- `docs`, `test`, `perf`, `revert` -- self-explanatory

### Rules

- Commit **only the work produced in the current session**. Stage explicit
  paths (`git add <path>`), never `git add -A`.
- If a change genuinely spans multiple scopes (e.g. a UI component plus the
  composable it uses), split it into one commit per scope -- but confirm the
  split with the user first.
- When the right type or scope is not obvious, ask for clarification instead
  of guessing.
- Subject: imperative mood, lowercase, `<= ~72` chars, no trailing period. Add
  a body (`-m`) explaining the "why" when non-obvious.
- `deps` changes carry lockfile and workspace updates together with the
  dependency change.
- Never commit secrets. `.env*` is gitignored.
- Do not push unless asked.

## Releasing

Releases are tagged locally and published by pushing the tag; GitHub Actions
then verifies the version and creates a GitHub release from `CHANGELOG.md`.

```bash
pnpm tag          # patch bump (chore(release): X.Y.Z)
pnpm tag:minor    # minor bump
pnpm tag:major    # major bump
pnpm release:publish   # git push --follow-tags
```

Workspace packages are tagged per package, using the package name as the tag
prefix and a package-local `CHANGELOG.md`:

```bash
pnpm tag:package playground-layout         # @calmecac-vue/playground-layout@X.Y.Z
pnpm tag:package playground-layout minor
pnpm tag:package @calmecac-vue/shared-types patch --dry-run
```

`packages/vue-repl` and `packages/party-kit` are git-subtree mirrors — tag those
in their upstream repositories instead.

`pnpm tag` runs `commit-and-tag-version`: it bumps `package.json`, regenerates
`CHANGELOG.md` from conventional commits, commits the bump as
`chore(release): <version>`, and creates a tag without a `v` prefix
(`0.3.1`). Existing tags (`0.1.0-beta` ... `0.3.1-beta`) follow the same
prefix-less style, which is why `.versionrc` sets `"tagPrefix": ""`.

- Never hand-write a `release` commit or edit the `package.json` version.
- Do not create tags yourself unless the user explicitly asks for a release;
  committing is a separate step.
- The in-app changelog sheet imports `CHANGELOG.md` at build time, so a release
  updates both the footer version badge (`vite-plugin-package-version`) and the
  changelog the badge opens.

## Commands

| command | purpose |
| --- | --- |
| `pnpm dev` | run the app with Vite |
| `pnpm build` | type-check, build, minify workers, compress assets |
| `pnpm bi` | build and copy `dist/` into `../amoxtli-vue/src/templates/yehyecoa` |
| `pnpm lint` | lint the root project |
| `pnpm lint:all` | lint the root project and all workspace packages |
| `pnpm test:e2e` | Playwright end-to-end tests |
| `pnpm cz` | interactive conventional commit (commitizen) |
| `pnpm tag:package <pkg> [bump]` | tag a workspace package (bump + changelog + release commit + tag) |
