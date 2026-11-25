import Cedar from '/cedar-design-web/packages/ui/src/ripple/index.ts'
import Maple from '/maple-design-mobile/packages/ui/src/ripple/index.ts'

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
async function run(name, directive) {
  const stats = window.__observerStats,
    hosts = [],
    area = document.querySelector('#hosts'),
    mutations = document.querySelector('#mutations')
  const initial = { ...stats }
  for (let i = 0; i < 20; i++) {
    const el = document.createElement('button')
    el.textContent = `${name} ${i}`
    area.append(el)
    directive.mounted(el, { value: {} })
    hosts.push(el)
  }
  await Promise.resolve()
  const idle = { ...stats }
  for (const host of hosts) host.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0 }))
  await wait(80)
  const active = { ...stats },
    t = performance.now()
  for (let i = 0; i < 20; i++) {
    for (let j = 0; j < 50; j++) {
      const node = document.createElement('span')
      mutations.append(node)
      node.remove()
    }
    await Promise.resolve()
  }
  const mutationsElapsed = performance.now() - t,
    afterMutations = { ...stats }
  document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, button: 0 }))
  await wait(900)
  const afterRelease = { ...stats }
  for (const host of hosts) {
    directive.unmounted(host)
    host.remove()
  }
  return {
    name,
    idleCreated: idle.created - initial.created,
    activeObservers: active.active - initial.active,
    mutationCallbacks: afterMutations.callbacks - active.callbacks,
    callbackMs: afterMutations.callbackMs - active.callbackMs,
    mutationsElapsed,
    remainingAfterRelease: afterRelease.active - initial.active,
  }
}
document.querySelector('#run').addEventListener('click', async (event) => {
  event.currentTarget.disabled = true
  const results = []
  try {
    for (const [name, directive] of [
      ['Cedar', Cedar],
      ['Maple', Maple],
    ])
      results.push(await run(name, directive))
  } catch (error) {
    results.push({ error: String(error), stack: error.stack })
  }
  document.querySelector('#results').textContent = JSON.stringify(results, null, 2)
  event.currentTarget.disabled = false
})
