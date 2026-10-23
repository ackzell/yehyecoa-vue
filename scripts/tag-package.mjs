#!/usr/bin/env node
/**
 * Tag a workspace package with commit-and-tag-version.
 *
 * The root `pnpm tag` only bumps the root package. This runs the same release
 * flow from inside `packages/<name>`: bump version, regenerate that package's
 * CHANGELOG, commit `chore(release): <pkg>@<version>` and tag it.
 *
 *   pnpm tag:package playground-layout
 *   pnpm tag:package playground-layout minor
 *   pnpm tag:package @calmecac-vue/shared-types patch --dry-run
 *
 * `vue-repl` and `party-kit` are git-subtree mirrors; tag those in their
 * upstream repositories instead.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const packagesDir = join(root, 'packages');
const bumpTypes = new Set(['patch', 'minor', 'major']);

const args = process.argv.slice(2);
const dryRunIndex = args.indexOf('--dry-run');
const dryRun = dryRunIndex !== -1;
if (dryRun)
  args.splice(dryRunIndex, 1);

const [packageArg, bumpArg = 'patch'] = args;

function usage() {
  console.log(`Usage: pnpm tag:package <package> [patch|minor|major] [--dry-run]

  <package>  directory under packages/ or full package name

Examples:
  pnpm tag:package playground-layout
  pnpm tag:package playground-layout minor
  pnpm tag:package @calmecac-vue/shared-types patch --dry-run

Note: vue-repl and party-kit are git-subtree mirrors; tag them upstream.`);
}

if (!packageArg || packageArg === '--help' || packageArg === '-h') {
  usage();
  process.exit(packageArg ? 0 : 1);
}

if (!bumpTypes.has(bumpArg)) {
  console.error(`[tag:package] invalid bump type "${bumpArg}" (expected patch, minor or major)`);
  process.exit(1);
}

function readPackage(dir) {
  const path = join(dir, 'package.json');
  return existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : null;
}

const candidateDirs = readdirSync(packagesDir)
  .map(dir => join(packagesDir, dir))
  .filter(dir => existsSync(join(dir, 'package.json')));

const packageDir = packageArg.startsWith('@')
  ? candidateDirs.find(dir => readPackage(dir)?.name === packageArg)
  : candidateDirs.find(dir => dir === join(packagesDir, packageArg));

if (!packageDir) {
  console.error(`[tag:package] package "${packageArg}" not found under packages/`);
  console.error(`Available: ${candidateDirs.map((dir) => {
    const pkg = readPackage(dir);
    return `${dir.split('/').pop()} (${pkg?.name})`;
  }).join(', ')}`);
  process.exit(1);
}

const pkg = readPackage(packageDir);
if (!pkg) {
  console.error(`[tag:package] could not read ${packageDir}/package.json`);
  process.exit(1);
}

const bin = join(root, 'node_modules', '.bin', process.platform === 'win32'
  ? 'commit-and-tag-version.cmd'
  : 'commit-and-tag-version');

const flags = [
  '--release-as',
  bumpArg,
  '--tag-prefix',
  `${pkg.name}@`,
  '--path',
  '.',
  '--releaseCommitMessageFormat',
  'chore(release): {{currentTag}}',
  '--no-verify',
];
if (dryRun)
  flags.push('--dry-run');

console.log(`[tag:package] ${pkg.name}@${pkg.version} → ${bumpArg}${dryRun ? ' (dry run)' : ''}`);
execFileSync(bin, flags, { cwd: packageDir, stdio: 'inherit' });
