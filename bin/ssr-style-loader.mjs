// Asset-only loader for Node-based SSR entry checks. Never replace JavaScript.
export async function load(url, context, nextLoad) {
  if (new URL(url).pathname.endsWith('.css')) {
    return { format: 'module', source: 'export {}', shortCircuit: true }
  }
  return nextLoad(url, context)
}
