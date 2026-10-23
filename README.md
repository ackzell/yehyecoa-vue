# yehyecoa-vue

> **[yeh-yeh-CO-ah](https://nahuatl.wired-humanities.org/content/yeyecoa)** in Nahuatl means to try something; to try or experiment with something; to rehearse;

This is our own spin on the [Vue Playground](https://github.com/vuejs/core/blob/main/packages-private/sfc-playground/README.md). Originally intended to be used within a [TutorialKit](https://tutorialkit.dev/) (_tk_ in this readme to save some keystrokes) preview window.

Most notably, it doesn't allow for switching Vue versions nor it displays the compiled code. Since this will be focused (at least at first) on the basic concepts, we don't want all of that.

![screenshot](docs/screenshot.png)

## Usage

### As part of [amoxtli-vue](https://github.com/ackzell/amoxtli-vue)

This is the playground that will load into a preview pane in the `amoxtli-vue` project.
It reads the different [code files in the lessons](https://tutorialkit.dev/guides/creating-content/#a-lesson-code) provided from that repo and loads them into the monaco editor to interact with them.

![screenshot](docs/amoxtli-integration.png)

#### Installing it in amoxtli-vue

An npm task is available for when you want to see your changes embedded into the tk project:

```bash
# build and install on tk project
npm bi
```
This will first build the project and then copy the required contents from the `/dist` folder into the `amoxtli-vue/src/templates/yehyecoa/` folder.

### Standalone
> [!Note]
> Take a look at `amoxtli-vue/src/templates/yehyecoa/server.js` as it contains logic to _notify_ `yehyecoa-vue` when the contents of the file have been updated. This is if you want to dynamically update the contents of the editor (and thus perfect for embedding into a tk webcontainer).

## Development Environment Setup

### Prerequisites

- **Node.js**: Version 24.5.0 (exact version specified in `.node-version` file and `engines` field)

  **Recommended**: Use [fnm](https://github.com/Schniz/fnm) to manage Node.js versions:
  ```bash
  # Install fnm (if not already installed)
  curl -fsSL https://fnm.vercel.app/install | bash

  # Use the project's Node.js version (reads .node-version automatically)
  fnm use

  # Or install and use the specific version
  fnm install 24.5.0
  fnm use 24.5.0
  ```

- **pnpm**: Version 10.17.0 (specified as packageManager)
  ```bash
  npm install -g pnpm@10.17.0
  ```

### Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [UnoCSS](https://marketplace.visualstudio.com/items?itemName=antfu.unocss)

#### Recommended VSCode Extensions

- **Vue.volar** - Vue language support
- **dbaeumer.vscode-eslint** - ESLint integration
- **antfu.unocss** - UnoCSS IntelliSense
- **bradlc.vscode-tailwindcss** - TailwindCSS IntelliSense (for CSS utilities)
- **Vue.vscode-typescript-vue-plugin** - Vue TypeScript support

### Project Architecture

This is a **pnpm workspace** with multiple packages:

- **Root**: Main Vue application with real-time collaboration
- **`packages/party-kit/`**: PartyKit server for WebSocket communication
- **`packages/vue-repl/`**: Enhanced Vue REPL component (forked from @vue/repl)
- **`packages/shared-types/`**: Shared TypeScript types

### Installation

1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url>
   cd yehyecoa-vue
   pnpm install
   ```

2. **Install dependencies for all workspace packages**:
   ```bash
   # This installs dependencies for all packages in the workspace
   pnpm install --recursive
   ```

### Development Workflow

#### Option 1: Full Development Setup (Recommended)

For complete real-time collaboration features, you need both the main app and PartyKit server:

1. **Start the PartyKit server** (in a separate terminal):
   ```bash
   cd packages/party-kit
   pnpm dev
   ```
   This starts the WebSocket server at `http://localhost:1999`

2. **Start the main application** (in another terminal):
   ```bash
   # From project root
   pnpm dev
   ```
   This starts the Vue app at `http://localhost:5173`

#### Option 2: Frontend Only Development

If you're only working on UI components and don't need real-time features:

```bash
pnpm dev
```

> [!Note]
> Without the PartyKit server, collaboration features will be disabled but the REPL will still function as a standalone editor.

#### Option 3: Working on vue-repl Package

If you're modifying the core REPL functionality:

```bash
cd packages/vue-repl
pnpm dev
```

### Available Scripts

#### Root Package Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production (includes all optimizations)
- `pnpm preview` - Preview production build
- `pnpm type-check` - Run TypeScript type checking
- `pnpm lint` - Lint the main package
- `pnpm lint:all` - Lint all packages in workspace
- `pnpm lint:fix` - Auto-fix linting issues
- `pnpm tag` - Bump the patch version, regenerate `CHANGELOG.md`, commit and tag
- `pnpm tag:minor` / `pnpm tag:major` - Same as above for minor / major bumps
- `pnpm release:publish` - Push the current branch and its tags
- `pnpm cz` - Interactive conventional-commit prompt (commitizen)

#### Specialized Scripts

- `pnpm bi` - **Build and Install**: Build project and copy to amoxtli-vue
- `pnpm sync:vue-repl` - Sync with upstream vue-repl fork
- `pnpm sync:party-kit` - Sync with upstream party-kit fork

### Environment Configuration

The project uses:

- **UnoCSS** for utility-first CSS with multiple presets
- **Monaco Editor** for code editing with TypeScript support
- **Pinia** for state management
- **PartyKit** for real-time WebSocket communication
- **Vite** for build tooling and development server

### Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

### Testing

```bash
# Run tests for party-kit package
cd packages/party-kit
pnpm test

# Run tests with coverage
pnpm test:coverage
```

### Troubleshooting

#### Common Issues

1. **Node version mismatch**: Ensure you're using Node.js 24.5.0+
2. **pnpm version issues**: Use the exact version specified (`10.17.0`)
3. **WebSocket connection fails**: Make sure PartyKit server is running on port 1999
4. **Monaco Editor not loading**: Check that workers are properly bundled (handled by build scripts)

#### Workspace Dependencies

If you encounter issues with workspace packages:

```bash
# Clean and reinstall all dependencies
pnpm clean
rm -rf node_modules packages/*/node_modules
pnpm install

# Rebuild all packages
pnpm -r run build
```

### Build and Deployment

#### Production Build

```bash
pnpm build
```

This will:
1. Type-check all files
2. Build the main application
3. Minify workers and assets
4. Build the server component
5. Compress assets for optimal loading

#### TutorialKit Integration Build

```bash
pnpm bi
```

This builds the project and copies the distribution files to the amoxtli-vue template directory.

### Releasing

Commits follow [Conventional Commits](https://www.conventionalcommits.org/). The
scope list and commit rules live in `AGENTS.md` (mirrored in
`.vscode/settings.json` for the Conventional Commits extension).

```bash
pnpm tag              # patch bump
pnpm tag:minor        # minor bump
pnpm tag:major        # major bump
pnpm release:publish  # git push --follow-tags
```

`pnpm tag` runs [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version):
it bumps `package.json`, regenerates `CHANGELOG.md` from the conventional
commits since the last tag, commits the bump as `chore(release): <version>`,
and creates a prefix-less tag (`.versionrc` sets `"tagPrefix": ""`). Pushing
that tag triggers `.github/workflows/release.yml`, which verifies the version
and creates a GitHub release from the matching changelog entry.

The current version is shown in the footer; clicking it opens the in-app
changelog, which is built from `CHANGELOG.md` at bundle time.

Workspace packages are released separately with their package-name tag prefix
and a package-local `CHANGELOG.md`:

```bash
pnpm tag:package playground-layout        # @calmecac-vue/playground-layout@X.Y.Z
pnpm tag:package playground-layout minor
pnpm tag:package @calmecac-vue/shared-types patch --dry-run
```

`vue-repl` and `party-kit` are git-subtree mirrors, so tag those in their
upstream repositories.

### Customize Configuration

See [Vite Configuration Reference](https://vite.dev/config/) and [UnoCSS Configuration](https://unocss.dev/config/).
