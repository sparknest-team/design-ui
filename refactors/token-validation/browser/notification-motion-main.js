import { createApp, h, nextTick, ref } from 'vue'
import Notification from '/cedar-design-web/packages/ui/src/notification/index.ts'
import '/cedar-design-web/packages/ui/src/notification/style/index.ts'

const records = ref([]),
  busy = ref(false)
let current,
  nextIdentity = 0
const known = new WeakMap()
const now = () => Math.round(performance.now() * 1000) / 1000
const publish = () => {
  records.value = [...records.value]
}
const sample = (element) => {
  const style = getComputedStyle(element)
  return {
    className: element.className,
    text: element.textContent.trim(),
    properties: style.transitionProperty,
    duration: style.transitionDuration,
    delay: style.transitionDelay,
    easing: style.transitionTimingFunction,
  }
}
const bars = (element) => [
  ...(element.matches('.c-notification') ? [element] : []),
  ...element.querySelectorAll('.c-notification'),
]
const observer = new MutationObserver((mutations) => {
  let changed = false
  for (const mutation of mutations) {
    for (const element of mutation.addedNodes) {
      if (!(element instanceof HTMLElement)) continue
      for (const bar of bars(element)) {
        // TransitionGroup inserts empty temporary clones to measure move support.
        // Only content-bearing service items belong to this fixture's lifecycle.
        if (!current || known.has(bar) || !bar.textContent.trim().startsWith(current.id + ':')) continue
        const entry = { record: current, identity: ++nextIdentity, removed: false }
        known.set(bar, entry)
        entry.record.events.push({ type: 'created', at: now(), identity: entry.identity, ...sample(bar) })
        changed = true
      }
    }
    const entry = known.get(mutation.target)
    if (entry && mutation.type === 'attributes') {
      entry.record.events.push({
        type: mutation.target.className.includes('-leave-active') ? 'leave' : 'changed',
        at: now(),
        identity: entry.identity,
        ...sample(mutation.target),
      })
      changed = true
    }
    for (const element of mutation.removedNodes) {
      if (!(element instanceof HTMLElement)) continue
      for (const bar of bars(element)) {
        const entry = known.get(bar)
        if (!entry || entry.removed) continue
        entry.removed = true
        entry.record.events.push({ type: 'removed', at: now(), identity: entry.identity })
        entry.record.finalNodes = document.querySelectorAll('.c-notification').length
        if (entry.record.finalNodes === 0) {
          entry.record.complete = true
          busy.value = false
        }
        changed = true
      }
    }
  }
  if (changed) publish()
})
observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['class', 'style'],
})
for (const type of ['transitionrun', 'transitionstart', 'transitionend', 'transitioncancel']) {
  // Capture before Vue's target listener removes the node on transitionend.
  document.addEventListener(
    type,
    (event) => {
      const entry = known.get(event.target)
      if (!entry) return
      entry.record.transitions.push({
        type,
        at: now(),
        identity: entry.identity,
        property: event.propertyName,
        elapsedSeconds: event.elapsedTime,
        leaving: event.target.className.includes('-leave-active'),
      })
      publish()
    },
    true,
  )
}
function add(label, duration) {
  const record = current
  record.commands.push({ name: 'add-' + label, at: now(), duration })
  Notification.info({
    id: 'probe-' + current.id,
    content: current.id + ': ' + label,
    duration,
    closable: current.id === 'manual',
    onClose: () => {
      record.callbacks.push({ label, at: now() })
      publish()
    },
  })
  publish()
}
function run(id) {
  if (busy.value) return
  busy.value = true
  document.body.dataset.motion = id === 'long' ? 'long' : id === 'zero' ? 'zero' : 'default'
  current = {
    id,
    motion: document.body.dataset.motion,
    commands: [],
    callbacks: [],
    events: [],
    transitions: [],
    finalNodes: null,
    complete: false,
  }
  records.value.push(current)
  if (id === 'readd') {
    add('old', 300)
    setTimeout(() => {
      current.commands.push({ name: 'clear-topRight', at: now() })
      Notification.clear('topRight')
      add('new', 600)
    }, 150)
  } else if (id === 'update') {
    add('old', 1200)
    setTimeout(async () => {
      const oldNode = document.querySelector('.c-notification')
      add('updated', 600)
      await nextTick()
      current.sameNodeAfterUpdate = oldNode === document.querySelector('.c-notification')
      publish()
    }, 150)
  } else add('new', id === 'manual' ? 1200 : 600)
}
createApp({
  setup: () => () =>
    h('main', [
      h('h1', 'Cedar Notification：真实服务与离场生命周期'),
      h(
        'p',
        '业务 duration 与 CSS 离场分离；long 离场600ms/linear，zero 是显式覆写而非 OS 偏好。manual 组请原生点击通知关闭按钮。',
      ),
      ...['default', 'long', 'zero', 'readd', 'update', 'manual'].map((id) =>
        h('button', { disabled: busy.value, onClick: () => run(id), 'aria-label': 'Run notification ' + id }, id),
      ),
      h('table', [
        h(
          'thead',
          h(
            'tr',
            ['组', '完成', '公开关闭回调', '最终节点'].map((x) => h('th', x)),
          ),
        ),
        h(
          'tbody',
          records.value.map((r) =>
            h(
              'tr',
              [r.id, String(r.complete), String(r.callbacks.length), String(r.finalNodes)].map((x) => h('td', x)),
            ),
          ),
        ),
      ]),
      h('output', { 'aria-label': 'Notification records' }, JSON.stringify(records.value, null, 2)),
    ]),
}).mount('#app')
