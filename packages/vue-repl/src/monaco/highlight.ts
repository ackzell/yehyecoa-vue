import { shikiToMonaco } from '@shikijs/monaco'
import * as monaco from 'monaco-editor-core'
import { createHighlighterCoreSync } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine-javascript.mjs'

import langJsx from 'shiki/langs/jsx.mjs'
import langTsx from 'shiki/langs/tsx.mjs'
import langVue from 'shiki/langs/vue.mjs'
import themeLight from 'shiki/themes/snazzy-light.mjs'
import themeDark from 'shiki/themes/vesper.mjs'

let registered = false
export function registerHighlighter() {
  if (!registered) {
    const highlighter = createHighlighterCoreSync({
      themes: [themeDark, themeLight],
      langs: [langVue, langTsx, langJsx],
      engine: createJavaScriptRegexEngine(),
    })
    monaco.languages.register({ id: 'vue' })
    shikiToMonaco(highlighter, monaco)
    registered = true
  }

  return {
    light: themeLight.name!,
    dark: themeDark.name!,
  }
}
