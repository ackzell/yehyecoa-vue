# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [0.4.0](https://github.com/ackzell/yehyecoa-vue/compare/0.3.1-beta...0.4.0) (2026-10-26)


### Features

* **lesson:** broadcast full yv-lesson config over SSE ([2186fb6](https://github.com/ackzell/yehyecoa-vue/commit/2186fb61dbd85a4d05e20eb5344e761ef32db32a))
* **playground-layout:** add icon and default-open options to FileTree ([f45f1bb](https://github.com/ackzell/yehyecoa-vue/commit/f45f1bbb3d3416b9964af041f3dab77eccff5679))
* **playground-layout:** add pure tree logic package (Phase 1) ([fbc555d](https://github.com/ackzell/yehyecoa-vue/commit/fbc555d013c9e205bdd9ddc276b02ccfbc12f37b))
* **playground-layout:** port dock node + file tree components (Phase 2) ([d86d260](https://github.com/ackzell/yehyecoa-vue/commit/d86d26063645c461fc79c50a8f2900330df5bb16))
* **playground:** compose dock layout with file tree (Phase 3) ([c9ddc20](https://github.com/ackzell/yehyecoa-vue/commit/c9ddc20a5f84df3625f91c57a1aa617b8ffc78ce))
* **repl:** add headless provider and panel components ([48caa4a](https://github.com/ackzell/yehyecoa-vue/commit/48caa4ae1e0845ad5a00104273f1f2d3f1c2f87c))
* **ui:** open an in-app changelog from the footer version ([5db4903](https://github.com/ackzell/yehyecoa-vue/commit/5db49039c3147ed89a230194e74bb16854d22b62))
* **video:** add dock and changelog beats to the promo ([2f66424](https://github.com/ackzell/yehyecoa-vue/commit/2f66424971bc1fa3284f5674fddb20a3a058df6c))


### Bug Fixes

* **playground-layout:** forward slots to nested dock nodes, harden drag handles ([7a1c694](https://github.com/ackzell/yehyecoa-vue/commit/7a1c694da46411a845262de2692727e02dc91567))
* **repl-sync:** watch editor ref via getter ([5dfc0cf](https://github.com/ackzell/yehyecoa-vue/commit/5dfc0cf44542429db3310280bcd7fac1c828919a))
* **repl:** pin latest TypeScript to 5.9.3 for Monaco types ([f0f404d](https://github.com/ackzell/yehyecoa-vue/commit/f0f404dd6665b35301eedc63885c7d4379873fb6))
* **repl:** run the preview under a strict CSP ([b0b29d0](https://github.com/ackzell/yehyecoa-vue/commit/b0b29d0c7140f427fbe86664f4907a3281f8b85d))
* **sync:** keep the public build offline without a PartyKit host ([61c7abf](https://github.com/ackzell/yehyecoa-vue/commit/61c7abf4177cf33fd675bea11453c85492cfa800))

## [0.3.1-beta](https://github.com/ackzell/yehyecoa-vue/compare/0.3.0-beta...0.3.1-beta) (2025-10-12)


### Features

* **repl:** apply expressive-code color corrections ([2e3f550](https://github.com/ackzell/yehyecoa-vue/commit/2e3f5505d50431446c19bc1cfdd5405f860d5f52))


### Bug Fixes

* **repl:** size the console dynamically so long output overflows ([a481794](https://github.com/ackzell/yehyecoa-vue/commit/a481794cedc8c210f0535c2bc2200cfd742b4ca6))

## [0.3.0-beta](https://github.com/ackzell/yehyecoa-vue/compare/0.2.0-beta...0.3.0-beta) (2025-09-27)


### Features

* **repl:** integrate the console panel ([02909b6](https://github.com/ackzell/yehyecoa-vue/commit/02909b6e44fa58fb86d5bbffa4e774ead750a1d4))

## [0.2.0-beta](https://github.com/ackzell/yehyecoa-vue/compare/0.1.0-beta...0.2.0-beta) (2025-09-26)


### Features

* **sync:** add broadcast mode for instructor-led sessions ([61ebd39](https://github.com/ackzell/yehyecoa-vue/commit/61ebd39a1a4d9046cb0f5849a78ccecd699ee4fb))

## 0.1.0-beta (2025-09-08)


### Features

* **lesson:** load lesson files from an external source ([3c16978](https://github.com/ackzell/yehyecoa-vue/commit/3c169788cb2e7d2ba0c23ccffb2c8e665f43a2b3))
* **repl:** add manual snapshots with side-by-side diff views ([4b95294](https://github.com/ackzell/yehyecoa-vue/commit/4b95294b043352ab96e3f50eab5f4bdef59776e7), [1c3d3ec](https://github.com/ackzell/yehyecoa-vue/commit/1c3d3ecb2a2c690209c8cdf14d056b8251be66a4))
* **repl:** add the history sidebar with search and virtual scrolling ([5465afd](https://github.com/ackzell/yehyecoa-vue/commit/5465afd8d6eba93717adf7fe12add5248cb04d4c))
* **repl:** toggle between vertical and horizontal layouts ([7c94c27](https://github.com/ackzell/yehyecoa-vue/commit/7c94c2786b0ed96b79b26a69cb419b847b91daf5))
* **server:** serve the built app standalone with gzipped assets ([922fe57](https://github.com/ackzell/yehyecoa-vue/commit/922fe572597eeed50f3f69447727bebfb37b036d))
* **ui:** add custom toast notifications ([53f7ed2](https://github.com/ackzell/yehyecoa-vue/commit/53f7ed2d9135869e4e5ab676891691a441800246))


### Bug Fixes

* **ui:** prevent scrollbar toggling from shifting the layout ([fbc66a8](https://github.com/ackzell/yehyecoa-vue/commit/fbc66a855f28bde98bb36aad4a52273ea65c87cc))
