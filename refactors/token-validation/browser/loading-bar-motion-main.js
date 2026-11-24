import { createApp, h, ref } from 'vue'
import LoadingBar from '/maple-design-mobile/packages/ui/src/loading-bar/index.ts'

const cases = ref([]),
  busy = ref(false)
let current
const known = new WeakMap()
const stamp = () => Math.round(performance.now() * 1000) / 1000
const sample = (element) => {
  const css = getComputedStyle(element)
  return {
    width: element.style.width,
    opacity: element.style.opacity,
    error: element.classList.contains('mp-loading-bar--error'),
    duration: css.transitionDuration,
    delay: css.transitionDelay,
    properties: css.transitionProperty,
    easing: css.transitionTimingFunction,
  }
}
const observer = new MutationObserver((mutations) => {
  let changed = false
  for (const mutation of mutations) {
    for (const element of mutation.addedNodes) {
      if (!(element instanceof HTMLElement)) continue
      const bar = element.matches('.mp-loading-bar') ? element : element.querySelector('.mp-loading-bar')
      if (bar && current && !known.has(bar)) {
        known.set(bar, current)
        current.events.push({ type: 'created', at: stamp(), ...sample(bar) })
        changed = true
      }
    }
    const record = known.get(mutation.target)
    if (record && mutation.type === 'attributes') {
      record.events.push({ type: 'changed', at: stamp(), ...sample(mutation.target) })
      changed = true
    }
    for (const element of mutation.removedNodes) {
      if (!(element instanceof HTMLElement)) continue
      const bar = known.has(element) ? element : element.querySelector('.mp-loading-bar')
      const record = known.get(bar)
      if (record) {
        record.events.push({ type: 'removed', at: stamp() })
        record.finalNodes = document.querySelectorAll('.mp-loading-bar').length
        busy.value = false
        changed = true
      }
    }
  }
  if (changed) cases.value = [...cases.value]
})
observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['style', 'class'],
})

function command(name) {
  current.commands.push({ name, at: stamp() })
  LoadingBar[name]()
  cases.value = [...cases.value]
}
function run(id, timing = 'default') {
  if (busy.value) return
  busy.value = true
  document.body.dataset.timing = timing
  current = { id, timing, commands: [], events: [], finalNodes: null }
  cases.value.push(current)
  LoadingBar.resetDefaultOptions()
  LoadingBar.setDefaultOptions({ top: 4, height: 6 })
  if (id === 'error') command('error')
  else {
    command('start')
    setTimeout(() => {
      command('finish')
      if (id === 'repeated') {
        command('finish')
        setTimeout(() => command('finish'), 200)
      }
      if (id === 'restart') {
        setTimeout(() => command('start'), 100)
        setTimeout(() => command('finish'), 600)
      }
    }, 350)
  }
}
createApp({
  setup: () => () =>
    h('main', [
      h('h1', 'Maple LoadingBar：原生操作与生命周期'),
      h(
        'p',
        'default 250ms/ease；long 600ms/linear + width 100ms / opacity 200ms delay；zero 为显式覆写，非 OS 偏好。',
      ),
      ...[
        ['default', 'default'],
        ['long', 'long'],
        ['zero', 'zero'],
        ['repeated', 'default'],
        ['restart', 'long'],
        ['error', 'default'],
      ].map(([id, timing]) =>
        h('button', { disabled: busy.value, onClick: () => run(id, timing), 'aria-label': 'Run ' + id }, id),
      ),
      h('output', { 'aria-label': 'LoadingBar records' }, JSON.stringify(cases.value, null, 2)),
    ]),
}).mount('#app')
