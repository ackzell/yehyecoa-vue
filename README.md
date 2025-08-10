# Yehyecoa

> **[yeh-yeh-CO-ah](https://nahuatl.wired-humanities.org/content/yeyecoa)** means to try something; to try or experiment with something; to rehearse;

This is my own spin on the [Vue Playground](https://github.com/vuejs/core/blob/main/packages-private/sfc-playground/README.md). Originally intended to be used within a [TutorialKit](https://tutorialkit.dev/) preview window.

Most notably, it doesn't allow for switching Vue versions nor it displays the compiled code. Since this will be focused (at least at first) on the basic concepts, we don't want all of that.

![screenshot](docs/screenshot.png)

TODO: Update reference to TutorialKit project.

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
