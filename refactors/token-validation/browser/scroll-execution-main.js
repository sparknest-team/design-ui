import { scrollTo as cedarScroll } from '/cedar-design-web/packages/ui/src/_utils/maple/elements.ts'
import { scrollTo as mapleScroll } from '/maple-design-mobile/packages/ui/src/utils/elements.ts'

const results = [],
  resources = new Set(),
  jobs = new Map()
let busy = false,
  alive = true
const wait = (ms) =>
  new Promise((resolve) => {
    const id = setTimeout(() => {
      jobs.delete(id)
      resolve()
    }, ms)
    jobs.set(id, resolve)
  })
const round = (value) => Math.round(value * 10) / 10
const position = (target) => ({
  top: 'scrollTop' in target ? target.scrollTop : target.scrollY,
  left: 'scrollLeft' in target ? target.scrollLeft : target.scrollX,
})
const kinds = ['main-default', 'main-zero', 'iframe-element', 'iframe-window']
function render() {
  document.querySelector('#status').textContent =
    `完成 ${results.length}/8；通过 ${results.filter((r) => r.passed).length}；失败 ${results.filter((r) => !r.passed).length}`
  document.querySelectorAll('#buttons button').forEach((button) => {
    button.disabled = busy
  })
  document.querySelector('#summary').replaceChildren(
    ...results.map((row) => {
      const li = document.createElement('li')
      li.textContent = `${row.name} ${row.kind}: ${row.passed ? 'PASS' : 'FAIL'}; elapsed ${row.elapsed}ms; owner RAF ${row.ownerRequests}; host RAF ${row.hostRequests}; final targets ${row.finalTargets}`
      return li
    }),
  )
  document.querySelector('output').textContent = JSON.stringify({ busy, results }, null, 2)
}
async function run(name, kind) {
  if (busy) return
  busy = true
  render()
  let target, iframe, start, cleanup
  const frames = [],
    counters = { owner: 0, host: 0 }
  try {
    let view = window
    if (kind.startsWith('iframe')) {
      iframe = document.createElement('iframe')
      iframe.title = `${name} scroll target`
      const loaded = new Promise((resolve) => iframe.addEventListener('load', resolve, { once: true }))
      iframe.srcdoc =
        '<!doctype html><html><meta charset="utf-8"><style>html,body{margin:0;scroll-behavior:auto}.page{width:1000px;height:1200px;background:linear-gradient(#cfe,#ecf)}#scroller{width:240px;height:120px;overflow:auto;scroll-behavior:auto}#scroller>div{width:800px;height:800px;background:linear-gradient(#fdb,#acf)}</style><div class="page"><div id="scroller"><div>Actual iframe scroll content</div></div></div></html>'
      document.querySelector('#targets').append(iframe)
      await Promise.race([
        loaded,
        wait(2000).then(() => {
          throw new Error('iframe load deadline')
        }),
      ])
      view = iframe.contentWindow
      target = kind === 'iframe-window' ? view : view.document.querySelector('#scroller')
    } else {
      target = document.createElement('div')
      target.className = 'scroller'
      const content = document.createElement('div')
      content.className = 'content'
      content.textContent = 'Actual scroll content'
      target.append(content)
      document.querySelector('#targets').append(target)
    }
    target.scrollTo(0, 0)
    const reduced = view.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ownerOriginal = view.requestAnimationFrame,
      ownerDescriptor = Object.getOwnPropertyDescriptor(view, 'requestAnimationFrame')
    const hostOriginal = window.requestAnimationFrame,
      hostDescriptor = Object.getOwnPropertyDescriptor(window, 'requestAnimationFrame')
    function restore(object, key, descriptor) {
      if (descriptor) Object.defineProperty(object, key, descriptor)
      else Reflect.deleteProperty(object, key)
    }
    // Forward unchanged to native RAF; count helper requests, not sampling/emulation frames.
    Object.defineProperty(view, 'requestAnimationFrame', {
      configurable: true,
      value: (callback) => {
        counters.owner++
        return ownerOriginal.call(view, (timestamp) => {
          callback(timestamp)
          frames.push({ time: round(performance.now() - start), ...position(target) })
        })
      },
    })
    if (view !== window)
      Object.defineProperty(window, 'requestAnimationFrame', {
        configurable: true,
        value: (callback) => {
          counters.host++
          return hostOriginal.call(window, callback)
        },
      })
    cleanup = () => {
      restore(view, 'requestAnimationFrame', ownerDescriptor)
      if (view !== window) restore(window, 'requestAnimationFrame', hostDescriptor)
      iframe?.remove()
      if (!iframe) target.remove()
      resources.delete(cleanup)
    }
    resources.add(cleanup)
    start = performance.now()
    const options = { top: 220, left: 80, animation: (x) => x }
    if (kind === 'main-zero') options.duration = 0
    const promise = (name === 'Cedar' ? cedarScroll : mapleScroll)(target, options)
    const immediate = position(target),
      immediateOwnerRequests = counters.owner
    await promise
    const elapsed = round(performance.now() - start),
      final = position(target)
    await wait(50)
    const stable = position(target)
    const noMotion = kind === 'main-zero' || reduced
    const passed =
      final.top === 220 &&
      final.left === 80 &&
      stable.top === 220 &&
      stable.left === 80 &&
      counters.host === 0 &&
      (noMotion
        ? counters.owner === 0 && immediate.top === 220 && immediate.left === 80
        : elapsed >= 298 &&
          counters.owner >= 2 &&
          frames.some((f) => f.top > 0 && f.top < 220 && f.left > 0 && f.left < 80))
    cleanup()
    results.push({
      name,
      kind,
      passed,
      reducedQueryObserved: reduced,
      targetWindow: kind === 'iframe-window',
      sameOriginIframe: !!iframe,
      duration: kind === 'main-zero' ? 0 : 300,
      elapsed,
      immediate,
      immediateOwnerRequests,
      ownerRequests: counters.owner,
      hostRequests: counters.host,
      frames,
      final,
      stable,
      finalTargets: document.querySelector('#targets').children.length,
    })
  } catch (error) {
    cleanup?.()
    iframe?.remove()
    if (target && !iframe && 'remove' in target) target.remove()
    results.push({
      name,
      kind,
      passed: false,
      error: String(error),
      frames,
      finalTargets: document.querySelector('#targets').children.length,
    })
  } finally {
    busy = false
    if (alive) render()
  }
}
for (const name of ['Cedar', 'Maple']) {
  const group = document.createElement('section'),
    heading = document.createElement('h2')
  heading.textContent = name
  group.append(heading)
  for (const kind of kinds) {
    const button = document.createElement('button')
    button.textContent = `${name} ${kind}`
    button.addEventListener('click', () => run(name, kind))
    group.append(button)
  }
  document.querySelector('#buttons').append(group)
}
window.addEventListener(
  'pagehide',
  () => {
    alive = false
    for (const cleanup of [...resources]) cleanup()
    for (const [id, resolve] of jobs) {
      clearTimeout(id)
      resolve()
    }
    jobs.clear()
  },
  { once: true },
)
render()
