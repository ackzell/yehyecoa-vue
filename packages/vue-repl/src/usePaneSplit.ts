import { computed, reactive, toValue, useTemplateRef } from 'vue'
import type { MaybeRefOrGetter } from 'vue'

const MIN_SPLIT = 20
const MAX_SPLIT = 80

/**
 * Shared drag-to-resize state for the two-pane layouts inside the REPL.
 * The owning component renders an element with `ref="container"`.
 */
export function usePaneSplit(
  direction: MaybeRefOrGetter<'horizontal' | 'vertical' | undefined>,
) {
  const containerRef = useTemplateRef<HTMLElement>('container')
  const isVertical = computed(() => toValue(direction) === 'vertical')

  const state = reactive({
    dragging: false,
    split: 50,
  })

  const boundSplit = computed(() =>
    Math.min(MAX_SPLIT, Math.max(MIN_SPLIT, state.split)),
  )

  let startPosition = 0
  let startSplit = 0

  function dragStart(event: MouseEvent) {
    state.dragging = true
    startPosition = isVertical.value ? event.pageY : event.pageX
    startSplit = boundSplit.value
  }

  function dragMove(event: MouseEvent) {
    if (!state.dragging || !containerRef.value) {
      return
    }

    const position = isVertical.value ? event.pageY : event.pageX
    const totalSize = isVertical.value
      ? containerRef.value.offsetHeight
      : containerRef.value.offsetWidth

    if (!totalSize) {
      return
    }

    state.split = startSplit + ((position - startPosition) / totalSize) * 100
  }

  function dragEnd() {
    state.dragging = false
  }

  return {
    containerRef,
    isVertical,
    state,
    boundSplit,
    dragStart,
    dragMove,
    dragEnd,
  }
}
