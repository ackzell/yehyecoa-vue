<script setup lang="ts">
import { inject, onMounted, ref, useTemplateRef } from 'vue'
import LunaConsole from 'luna-console'
import { type LogPayload, injectKeyProps } from '../types'
import 'luna-object-viewer/luna-object-viewer.css'
import 'luna-dom-viewer/luna-dom-viewer.css'
import 'luna-data-grid/luna-data-grid.css'
import 'luna-console/luna-console.css'
import toEl from 'licia/toEl'

const { store, theme } = inject(injectKeyProps)!
const lunaRef = useTemplateRef('luna-ref')
const lunaConsole = ref<LunaConsole>()

onMounted(() => {
  if (!lunaRef.value) return
  lunaConsole.value = new LunaConsole(lunaRef.value, {
    theme: theme.value || 'light',
  })
  store.value.executeLog = ({ logLevel, data = [] }: LogPayload) => {
    const deserialized = data.map(deserializeMessage)
      ; (lunaConsole.value?.[logLevel] as any)?.(...deserialized)
  }
  store.value.clearConsole = clearLunaConsole
})

function clearLunaConsole() {
  lunaConsole.value?.clear(true)
}

// maybe make this configurable, but don't do it by default
// watch(() => store.value.activeFile.code, clearLunaConsole)

/**
 * Lossless deserialization:
 * - Recreates primitives as-is
 * - Returns enriched objects for complex types (with __type metadata)
 * - Keeps outerHTML, function source, accessor info, etc.
 */
function deserializeMessage(arg: any): any {
  if (arg === null || arg === undefined) return arg
  if (typeof arg !== 'object' || !arg.__type) return arg

  switch (arg.__type) {
    case 'undefined':
      return undefined

    case 'function': {
      // Approximated with a Function constructor (non-invocable stub)
      const fn = new Function(`/* [Function ${arg.name}] */`)
        ; (fn as any).__isStub = true
        ; (fn as any).__preview = `[Function ${arg.name}]${arg.isNative ? ' [native]' : ''}`
      return fn
    }

    case 'symbol':
      return Symbol(arg.description ?? '')

    case 'bigint':
      try {
        return BigInt(arg.value)
      } catch {
        return Object(`BigInt(${arg.value})`) // fallback object wrapper
      }

     case 'date':
      return arg.invalid ? new Date('Invalid Date') : new Date(arg.value).toString()

    case 'regexp':
      return new RegExp(arg.source, arg.flags)

    case 'error': {
      const e = new Error(arg.message)
      e.name = arg.name
        ; (e as any).stack = arg.stack
      return e
    }

   case 'dom': {
     if (arg.outerHTML) {
       const el = toEl(arg.outerHTML)
       Object.defineProperty(el, '__preview', {
         value: arg.outerHTML.replace(/\n/g, ''), // one-liner preview
         enumerable: false,
       })
       return el
     }
     if (arg.nodeType === 3 && arg.textContent) {
       return document.createTextNode(arg.textContent)
     }
     return `[DOM ${arg.tagName || 'Unknown'}]`
   }

    case 'vue_component':
      return `[VueComponent ${arg.name}]`

    case 'array': {
      const items = arg.items?.map(deserializeMessage) ?? []
      if (arg.truncated) {
        items.push(`...and ${arg.truncated} more items`)
      }
      return items
    }

    case 'object': {
      const out: Record<string, any> = {}
      for (const key in arg.properties) {
        const prop = arg.properties[key]
        if (prop && 'value' in prop) {
          out[key] = deserializeMessage(prop.value)
        }
      }
      if (arg.truncatedProperties) {
        out['__truncated__'] = `${arg.truncatedProperties} more properties`
      }
      // Method, not property
      Object.defineProperty(out, 'toString', {
        value: () => `[Object ${arg.constructor}]`,
        enumerable: false,
      })
      return out
    }

    case 'circular':
      return `[Circular ${arg.path ?? ''}]`

    case 'accessor':
      return `[Getter/Setter]`

    default:
      return `[Unrecognized ${arg.__type}]`
  }
}
</script>

<template>
  <div class="console-wrapper">
    <div class="console-title">
      <strong>Console</strong>
      <button class="clear-btn" @click="clearLunaConsole">clear</button>
    </div>
    <div class="luna-container">
      <div ref="luna-ref" />
    </div>
  </div>
</template>

<style scoped>
.console-wrapper {
  height: 100%;
}

.luna-container {
  height: 100%;
  width: 100%;
  overflow: auto;
}

.luna-console-theme-dark {
  background-color: var(--bg) !important;
}

.console-title {
  position: sticky;
  top: 0;
  border-bottom: 1px solid var(--border);
  background-color: var(--bg);
  padding-left: 10px;
  color: var(--text-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.clear-btn {
  font-size: 0.85rem;
  font-family: var(--font-code);
  color: var(--text-light);
  padding: 0.3rem;
  margin: 0.2rem;
  background-color: var(--bg);
  border-radius: 4px;
  border: 1px solid var(--border);
}

.clear-btn:hover {
  color: var(--color-branding);
}
</style>
