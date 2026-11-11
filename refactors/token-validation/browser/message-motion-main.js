import { createApp, h, nextTick, ref } from 'vue'
import Cedar from '/cedar-design-web/packages/ui/src/message/index.ts'
import Maple from '/maple-design-mobile/packages/ui/src/message/index.ts'
import '/cedar-design-web/packages/ui/src/message/style/index.ts'
import '/maple-design-mobile/packages/ui/src/message/style/index.ts'

const records = ref([]), busy = ref(false)
let current, identity = 0
const known = new WeakMap(), timers = new Set()
const now = () => Math.round(performance.now() * 1000) / 1000
const publish = () => { records.value = [...records.value] }
const roots = '.c-message,.mp-message'
const sample = e => {
  const s = getComputedStyle(e)
  return { className: e.className, duration: s.transitionDuration, delay: s.transitionDelay,
    easing: s.transitionTimingFunction, properties: s.transitionProperty }
}
const nodes = e => [...(e.matches(roots) ? [e] : []), ...e.querySelectorAll(roots)]
const observer = new MutationObserver(mutations => {
  for (const m of mutations) {
    for (const e of m.addedNodes) {
      if (!(e instanceof HTMLElement)) continue
      for (const node of nodes(e)) {
        if (!current || known.has(node) || !node.textContent.includes(current.id + ':')) continue
        const entry = { record: current, id: ++identity, removed: false }
        known.set(node, entry)
        entry.record.events.push({ type: 'created', at: now(), identity: entry.id, ...sample(node) })
      }
    }
    const entry = known.get(m.target)
    if (entry && m.type === 'attributes') entry.record.events.push({
      type: m.target.className.includes('-leave-active') ? 'leave' : 'changed',
      at: now(), identity: entry.id, ...sample(m.target),
    })
    for (const e of m.removedNodes) {
      if (!(e instanceof HTMLElement)) continue
      for (const node of nodes(e)) {
        const entry = known.get(node)
        if (!entry || entry.removed) continue
        entry.removed = true
        entry.record.events.push({ type: 'removed', at: now(), identity: entry.id })
      }
    }
  }
  if (current) current.finalNodes = document.querySelectorAll(roots).length
  publish()
})
observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class','style'] })
for (const type of ['transitionrun','transitionstart','transitionend','transitioncancel']) {
  document.addEventListener(type, e => {
    const entry = known.get(e.target)
    if (!entry) return
    entry.record.transitions.push({ type, at: now(), identity: entry.id, property: e.propertyName,
      elapsedSeconds: e.elapsedTime, leaving: e.target.className.includes('-leave-active') })
    publish()
  }, true)
}
const later = (fn, ms) => {
  const id = setTimeout(() => { timers.delete(id); fn() }, ms)
  timers.add(id)
}
async function run(platform, mode) {
  if (busy.value) return
  busy.value = true
  document.body.dataset.motion = mode === 'reopen' ? 'long' : mode
  const r = current = { id: platform + '-' + mode, platform, mode,
    commands: [], callbacks: [], events: [], transitions: [], finalNodes: null, complete: false }
  records.value.push(r)
  const service = platform === 'cedar' ? Cedar : Maple
  const add = label => {
    r.commands.push({ name: 'add-' + label, at: now(), duration: 1200 })
    const handle = service({ id: r.id, content: r.id + ': ' + label, duration: 1200,
      showIcon: false, onOpen: () => r.callbacks.push({ name: 'open', at: now() }),
      onOpened: () => r.callbacks.push({ name: 'opened', at: now() }),
      onClose: () => r.callbacks.push({ name: 'close', at: now() }),
      onClosed: () => r.callbacks.push({ name: 'closed', at: now() }) })
    publish()
    return handle
  }
  const first = add('first')
  later(() => {
    r.commands.push({ name: 'close-first', at: now() }); first.close(); publish()
    if (mode === 'reopen') later(async () => {
      const old = document.querySelector(roots)
      add('replacement')
      await nextTick()
      r.sameNodeAfterReopen = old === document.querySelector(roots)
      publish()
    }, 100)
  }, 800)
  later(() => {
    r.finalNodes = document.querySelectorAll(roots).length
    r.complete = r.finalNodes === 0 && r.callbacks.filter(c => c.name === 'closed').length === 1
    r.finishedAt = now()
    busy.value = false
    publish()
  }, mode === 'reopen' ? 3600 : 2000)
}
createApp({ setup: () => () => h('main', [
  h('h1', 'Message 双端真实服务与 CSS 完成链'),
  h('p', 'default/light；展示1200ms，800ms公开handle关闭。long=600ms/linear，zero不是OS偏好。重开组100ms后同ID重开，展示1200ms再自动关闭。'),
  ...['cedar','maple'].flatMap(p => ['default','long','zero','reopen'].map(m =>
    h('button', { disabled: busy.value, 'aria-label': 'Run ' + p + ' ' + m, onClick: () => run(p,m) }, p + '/' + m))),
  h('table', [
    h('thead', h('tr', ['组','完成','close/closed','最终节点'].map(x => h('th', x)))),
    h('tbody', records.value.map(r => h('tr', [r.id, String(r.complete),
      r.callbacks.filter(c=>c.name==='close').length + '/' + r.callbacks.filter(c=>c.name==='closed').length,
      String(r.finalNodes)].map(x=>h('td',x))))),
  ]),
  h('output', { 'aria-label': 'Message records' }, JSON.stringify(records.value, null, 2)),
]) }).mount('#app')
window.addEventListener('pagehide', () => {
  observer.disconnect(); timers.forEach(clearTimeout); timers.clear(); Cedar.clear(); Maple.clear()
}, { once: true })
