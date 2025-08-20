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

# Original Readme:

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
pnpm install
```

### Compile and Hot-Reload for Development

```sh
pnpm dev
```

### Type-Check, Compile and Minify for Production

```sh
pnpm build
```

### Lint with [ESLint](https://eslint.org/)

```sh
pnpm lint
```
