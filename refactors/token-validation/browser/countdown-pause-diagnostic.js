import { createApp, h, nextTick, ref } from 'vue'
import Cedar from '/cedar-design-web/packages/ui/src/countdown/index.ts'
import Maple from '/maple-design-mobile/packages/ui/src/countdown/index.ts'

// Hold animation frames while retaining the browser's real performance clock.
const originalRequest = window.requestAnimationFrame
const originalCancel = window.cancelAnimationFrame
let nextId = 0
const frames = new Map()
window.requestAnimationFrame = callback => { const id = ++nextId; frames.set(id, callback); return id }
window.cancelAnimationFrame = id => frames.delete(id)
const rows = ref([]), busy = ref(false)
const state = Object.fromEntries(['Cedar', 'Maple'].map(name => [name, { text: ref(), slot: ref(), events: [], running: ref(false) }]))
const total = t => t.days * 86400000 + t.hours * 3600000 + t.minutes * 60000 + t.seconds * 1000 + t.milliseconds
async function run(name) {
  if (busy.value) return
  busy.value = true
  const s = state[name]
  s.events = []
  s.running.value = true
  await nextTick()
  const initial = document.querySelector(`[data-owner="${name}"] .text-value`).textContent
  const started = performance.now()
  await new Promise(resolve => setTimeout(resolve, 300))
  const eventsBeforePause = s.events.length
  s.text.value.pause(); s.slot.value.pause()
  await nextTick()
  const section = document.querySelector(`[data-owner="${name}"]`)
  const text = Number(section.querySelector('.text-value').textContent)
  const slot = Number(section.querySelector('.slot-value').textContent)
  const elapsed = performance.now() - started
  const eventsAfterPause = s.events.length
  const passed = Number(initial) > 2900 && text < Number(initial) - 100 && slot < Number(initial) - 100 && text > 0 && slot > 0 && Math.abs(text - slot) < 100 && eventsBeforePause === eventsAfterPause
  rows.value.push({ name, passed, initial: Number(initial), text, slot, elapsed, eventsBeforePause, eventsAfterPause, pendingFrames: frames.size })
  s.running.value = false
  await nextTick()
  busy.value = false
}
const app = createApp({ setup: () => () => h('main', [
  h('h1', 'Countdown pause display: held frames, real clock'),
  ...['Cedar', 'Maple'].map(name => {
    const s = state[name], Component = name === 'Cedar' ? Cedar : Maple
    const props = key => ({ ref: s[key], time: 3000, format: 'SSS', onChange: value => s.events.push({ key, value: total(value) }) })
    return h('section', { 'data-owner': name }, [h('h2', name), h('button', { disabled: busy.value, onClick: () => run(name) }, `Run ${name}`),
      s.running.value && h('div', { class: 'text-value' }, [h(Component, props('text'))]),
      s.running.value && h('div', { class: 'slot-value' }, [h(Component, props('slot'), { default: value => String(total(value)) })])])
  }),
  h('output', { 'aria-label': 'results' }, JSON.stringify({ busy: busy.value, rows: rows.value }))
]) }).mount('#app')
window.addEventListener('pagehide', () => { app.unmount(); window.requestAnimationFrame = originalRequest; window.cancelAnimationFrame = originalCancel }, { once: true })
