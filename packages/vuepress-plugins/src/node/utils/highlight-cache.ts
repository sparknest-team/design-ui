// Bound retained source + HTML strings; never grow indefinitely during dev/HMR.
export function createHighlightCache(limit = 32 * 1024 * 1024) {
  const entries = new Map<string, { html: string; bytes: number }>()
  let bytes = 0
  return (code: string, lang: string, render: () => string): string => {
    const key = `${lang}\0${code}`
    const hit = entries.get(key)
    if (hit) {
      entries.delete(key)
      entries.set(key, hit)
      return hit.html
    }
    const html = render()
    const size = (key.length + html.length) * 2
    if (size > limit) return html
    while (entries.size && bytes + size > limit) {
      const oldest = entries.keys().next().value!
      bytes -= entries.get(oldest)!.bytes
      entries.delete(oldest)
    }
    entries.set(key, { html, bytes: size })
    bytes += size
    return html
  }
}
