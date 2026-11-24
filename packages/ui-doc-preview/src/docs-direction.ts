import { onBeforeUnmount, onMounted, ref } from 'vue'

export type DocsDirection = 'ltr' | 'rtl'
export const docsDirectionStorageKey = 'sparknest-docs-direction'
const isDirection = (value: unknown): value is DocsDirection => value === 'ltr' || value === 'rtl'

/** Shared by desktop documentation and the independently loaded mobile preview. */
export function useDocsDirection() {
  const direction = ref<DocsDirection>('ltr')
  function read(): DocsDirection {
    try {
      const value = window.localStorage.getItem(docsDirectionStorageKey)
      if (isDirection(value)) return value
    } catch {
      /* Browsers may disable persistent storage. */
    }
    return 'ltr'
  }
  function frameOrigin(frame: HTMLIFrameElement) {
    try {
      return new URL(frame.src, window.location.href).origin
    } catch {
      return undefined
    }
  }
  function send(frame: HTMLIFrameElement) {
    const origin = frameOrigin(frame)
    if (origin && origin !== 'null') {
      frame.contentWindow?.postMessage({ type: 'sparknest-docs-direction', direction: direction.value }, origin)
    }
  }
  function apply(value: DocsDirection, broadcast = true) {
    direction.value = value
    document.documentElement.dir = value
    try {
      window.localStorage.setItem(docsDirectionStorageKey, value)
    } catch {
      /* Keep the control usable without storage. */
    }
    const event = document.createEvent('CustomEvent')
    event.initCustomEvent('sparknest-docs-direction-change', false, false, value)
    window.dispatchEvent(event)
    if (broadcast) document.querySelectorAll('iframe').forEach(send)
  }
  function storage(event: StorageEvent) {
    if (event.key === docsDirectionStorageKey) apply(isDirection(event.newValue) ? event.newValue : 'ltr')
  }
  function sync(event: Event) {
    const value = (event as CustomEvent).detail
    if (isDirection(value)) direction.value = value
  }
  function load(event: Event) {
    if (event.target instanceof HTMLIFrameElement) send(event.target)
  }
  function parentOrigin() {
    try {
      return document.referrer ? new URL(document.referrer).origin : undefined
    } catch {
      return undefined
    }
  }
  function message(event: MessageEvent) {
    if (event.data?.type === 'sparknest-docs-direction-ready') {
      for (const frame of Array.from(document.querySelectorAll('iframe'))) {
        if (frame.contentWindow === event.source && frameOrigin(frame) === event.origin) send(frame)
      }
    } else if (
      event.data?.type === 'sparknest-docs-direction' &&
      isDirection(event.data.direction) &&
      window.parent !== window &&
      event.source === window.parent &&
      (event.origin === window.location.origin || event.origin === parentOrigin())
    ) {
      apply(event.data.direction)
    }
  }
  onMounted(() => {
    apply(read())
    window.addEventListener('storage', storage)
    window.addEventListener('message', message)
    window.addEventListener('sparknest-docs-direction-change', sync)
    document.addEventListener('load', load, true)
    const origin = parentOrigin()
    if (window.parent !== window && origin)
      window.parent.postMessage({ type: 'sparknest-docs-direction-ready' }, origin)
  })
  onBeforeUnmount(() => {
    window.removeEventListener('storage', storage)
    window.removeEventListener('message', message)
    window.removeEventListener('sparknest-docs-direction-change', sync)
    document.removeEventListener('load', load, true)
  })
  return { direction, toggle: () => apply(direction.value === 'ltr' ? 'rtl' : 'ltr') }
}
