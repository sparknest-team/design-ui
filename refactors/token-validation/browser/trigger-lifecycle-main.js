import { createApp, h, KeepAlive, nextTick, ref } from 'vue'
import CedarTrigger from '/cedar-design-web/packages/cedar-ui/src/trigger/index.ts'
import MapleTrigger from '/maple-design-mobile/packages/maple-ui/src/trigger/index.ts'
import '/cedar-design-web/packages/cedar-ui/src/trigger/style/index.ts'
import '/maple-design-mobile/packages/maple-ui/src/trigger/style/index.ts'

const results = ref([]), busy = ref(false), jobs = new Map()
const wait = ms => new Promise(resolve => {
  const id = setTimeout(() => { jobs.delete(id); resolve() }, ms)
  jobs.set(id, resolve)
})
const state = Object.fromEntries(['Cedar', 'Maple'].map(name => [name, {
  mounted: ref(false), active: ref(true), instance: ref(), reference: ref(), width: ref(80), events: [],
}]))
let current
function record(name, event, value) {
  const row = { event, value, time: performance.now() }
  state[name].events.push(row)
}
function panelCount(name) { return document.querySelectorAll(`[data-panel="${name}"]`).length }
async function run(name, kind) {
  if (busy.value) return
  busy.value = true
  const s = state[name], start = performance.now(), samples = []
  s.events = []
  const snapshot = phase => samples.push({ phase, time: performance.now(), panels: panelCount(name), resizeEvents: s.events.filter(e => e.event === 'resize').length, updates: s.events.filter(e => e.event === 'update:open').length })
  try {
    s.active.value = true
    s.width.value = 80
    s.mounted.value = true
    await nextTick()
    if (kind === 'delay-unmount') {
      // Fixture-authored mouseenter drives the real component timer; not trusted native hover evidence.
      s.reference.value.dispatchEvent(new MouseEvent('mouseenter'))
      snapshot('pending')
      await wait(100)
      s.mounted.value = false
      await nextTick()
      snapshot('unmounted')
      await wait(450)
      snapshot('after-deadline')
      const updates = s.events.filter(e => e.event === 'update:open')
      s.mounted.value = true
      await nextTick()
      s.reference.value.dispatchEvent(new MouseEvent('mouseenter'))
      await wait(350)
      snapshot('positive-remount-open')
      const positive = panelCount(name) === 1 && s.events.filter(e => e.event === 'update:open' && e.value === true).length === 1
      s.mounted.value = false
      await nextTick()
      snapshot('final-unmount')
      results.value.push({ name, kind, start, samples, events: [...s.events], passed: updates.length === 0 && positive && panelCount(name) === 0, finalPanels: panelCount(name) })
    } else {
      s.instance.value.open()
      await wait(350)
      snapshot('opened')
      s.width.value = 180
      await nextTick()
      await wait(180)
      snapshot('resized-active')
      s.active.value = false
      await nextTick()
      await wait(350)
      snapshot('deactivated')
      s.width.value = 220
      await nextTick()
      await wait(180)
      snapshot('changed-inactive')
      s.active.value = true
      await nextTick()
      s.instance.value.open()
      await wait(350)
      snapshot('reactivated-open')
      s.mounted.value = false
      await nextTick()
      await wait(350)
      snapshot('final-unmount')
      const phases = Object.fromEntries(samples.map(row => [row.phase, row]))
      const passed = phases.opened.panels === 1 && phases['resized-active'].resizeEvents > phases.opened.resizeEvents
        && phases.deactivated.resizeEvents === phases['changed-inactive'].resizeEvents && phases['reactivated-open'].panels === 1 && panelCount(name) === 0
      results.value.push({ name, kind, start, samples, events: [...s.events], passed, finalPanels: panelCount(name) })
    }
  } catch (error) {
    results.value.push({ name, kind, start, passed: false, error: String(error), samples, events: [...s.events] })
  } finally {
    s.mounted.value = false
    await nextTick()
    busy.value = false
  }
}
current = createApp({ setup: () => () => h('main', [
  h('h1', 'Trigger 真实浏览器生命周期'),
  h('p', 'default/light；真实组件、浏览器计时／ResizeObserver。入口按钮原生点击；mouseenter由夹具脚本发出，不声称原生hover或OS偏好通过。'),
  h('p', { role: 'status' }, `完成 ${results.value.length}/4；通过 ${results.value.filter(row => row.passed).length}；失败 ${results.value.filter(row => !row.passed).length}`),
  h('div', { id: 'cases' }, ['Cedar', 'Maple'].map(name => {
    const s = state[name], Trigger = name === 'Cedar' ? CedarTrigger : MapleTrigger
    const Child = Trigger
    return h('section', [
      h('h2', name),
      h('button', { disabled: busy.value, onClick: () => run(name, 'delay-unmount') }, `${name} delay unmount`),
      h('button', { disabled: busy.value, onClick: () => run(name, 'keepalive-resize') }, `${name} KeepAlive resize`),
      s.mounted.value ? h(KeepAlive, null, { default: () => s.active.value ? h(Child, {
        ref: s.instance, trigger: 'hover', mouseEnterDelay: 300, mouseLeaveDelay: 0, popupContainer: false,
        onOpen: () => record(name, 'open'), onClose: () => record(name, 'close'), onClosed: () => record(name, 'closed'),
        onResize: () => record(name, 'resize'), 'onUpdate:open': value => record(name, 'update:open', value),
      }, { default: () => h('button', { ref: s.reference, style: { width: `${s.width.value}px` } }, `${name} reference`),
        content: () => h('div', { 'data-panel': name }, `${name} real panel`) }) : null }) : null,
    ])
  })),
  h('ul', results.value.map(row => h('li', `${row.name} ${row.kind}: ${row.passed ? 'PASS' : 'FAIL'}; final panels ${row.finalPanels ?? '?'}`))),
  h('output', { 'aria-label': 'Trigger lifecycle results', style: { maxHeight: '260px', overflow: 'auto' } }, JSON.stringify({ busy: busy.value, results: results.value }, null, 2)),
]) }).mount('#app')
window.addEventListener('pagehide', () => {
  for (const [id, resolve] of jobs) { clearTimeout(id); resolve() }
  jobs.clear()
  current.unmount()
}, { once: true })
