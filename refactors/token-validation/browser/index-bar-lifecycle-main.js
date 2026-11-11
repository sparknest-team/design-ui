import { createApp, h, KeepAlive, nextTick, ref } from 'vue'
import IndexBar from '/maple-design-mobile/packages/ui/src/index-bar/IndexBar.vue'
import IndexAnchor from '/maple-design-mobile/packages/ui/src/index-bar/IndexAnchor.vue'
import '/maple-design-mobile/packages/ui/src/index-bar/style/index.ts'

const mounted = ref(false), active = ref(true), instance = ref(), surface = ref(), duration = ref(0)
const results = ref([]), busy = ref(false), jobs = new Map(), frames = new Map()
let events = [], writes = [], restoreScroll, app, alive = true
const wait = ms => new Promise(resolve => {
  const id = setTimeout(() => { jobs.delete(id); resolve() }, ms)
  jobs.set(id, resolve)
})
const frame = () => new Promise(resolve => {
  const id = requestAnimationFrame(() => { frames.delete(id); resolve() })
  frames.set(id, resolve)
})
const nodes = () => document.querySelectorAll('.mp-index-bar').length
const changes = () => events.filter(e => e.event === 'change').map(e => e.value)
const Child = { setup: () => () => h(IndexBar, {
  ref: instance, duration: duration.value,
  onChange: value => events.push({ event: 'change', value, time: performance.now() }),
  onClick: value => events.push({ event: 'click', value, time: performance.now() }),
}, () => ['A', 'B', 'C'].map(index => h('div', { class: 'group' }, [h(IndexAnchor, { index }), h('p', `Group ${index}`)]))) }
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)
async function run(kind) {
  if (busy.value) return
  busy.value = true; mounted.value = true; active.value = true; duration.value = kind === 'unmount' || kind === 'keepalive' ? 600 : 0
  const start = performance.now(), samples = []
  events = []; writes = []
  const snapshot = phase => samples.push({ phase, time: performance.now() - start, writes: writes.length, changes: [...changes()], active: document.querySelector('.mp-index-bar__anchor-item--active')?.textContent ?? '', top: surface.value.scrollTop, nodes: nodes() })
  let passed = false
  try {
    await nextTick(); await wait(80)
    const command = instance.value, target = surface.value, original = target.scrollTo
    const cTop = target.querySelectorAll('.group')[2].offsetTop + 2
    const aTop = target.querySelector('.group').offsetTop + 2
    target.scrollTo(0, 0); await wait(50); events = []
    const descriptor = Object.getOwnPropertyDescriptor(target, 'scrollTo')
    Object.defineProperty(target, 'scrollTo', { configurable: true, value: function(left, top) {
      writes.push({ left, top, time: performance.now() }); return original.call(this, left, top)
    } })
    restoreScroll = () => { if (descriptor) Object.defineProperty(target, 'scrollTo', descriptor); else Reflect.deleteProperty(target, 'scrollTo') }
    snapshot('ready')
    if (kind === 'replacement') {
      command.scrollTo('A'); command.scrollTo('C'); await wait(120); snapshot('latest-settled')
      passed = same(changes(), ['C']) && writes.length === 1 && samples.at(-1).top > 300
    } else if (kind === 'settlement') {
      void command.anchorClick({ anchorName: 'A' }); await nextTick()
      void command.anchorClick({ anchorName: 'B' }); await nextTick(); await frame()
      target.scrollTop = cTop; target.dispatchEvent(new Event('scroll')); snapshot('first-settlement-frame')
      const protectedState = same(changes(), ['A', 'B'])
      await frame(); await frame(); target.scrollTop = cTop; target.dispatchEvent(new Event('scroll')); await nextTick(); snapshot('settlement-complete')
      passed = protectedState && same(changes(), ['A', 'B', 'C'])
    } else {
      command.scrollTo('C'); await wait(120); snapshot('interpolating')
      const interpolating = writes.length > 0 && target.scrollTop > 0 && target.scrollTop < 480
      if (kind === 'unmount') mounted.value = false
      else active.value = false
      await nextTick(); snapshot('cancelled')
      command.scrollTo('B'); void command.anchorClick({ anchorName: 'B', manualCall: true })
      await wait(kind === 'unmount' ? 700 : 220); snapshot('retained-inert')
      const cancelled = samples.at(-1), previous = samples.at(-2)
      passed = interpolating && cancelled.writes === previous.writes && same(cancelled.changes, previous.changes) && cancelled.top === previous.top && cancelled.nodes === 0 && events.every(e => e.event !== 'click')
      if (kind === 'keepalive') {
        active.value = true; await nextTick(); await wait(700); snapshot('reactivated-settled')
        target.scrollTop = aTop; target.dispatchEvent(new Event('scroll')); await nextTick(); snapshot('listener-restored')
        passed &&= same(changes(), ['C', 'A']) && samples.at(-1).nodes === 1
      }
    }
    mounted.value = false; await nextTick(); snapshot('final-unmounted')
    passed &&= nodes() === 0
    results.value.push({ kind, passed, samples, events: events.map(e => ({ ...e, time: e.time - start })), writes: writes.map(e => ({ ...e, time: e.time - start })), finalNodes: nodes() })
  } catch(error) { results.value.push({ kind, passed: false, error: String(error), samples, finalNodes: nodes() }) }
  finally { restoreScroll?.(); restoreScroll = undefined; mounted.value = false; if(alive) { await nextTick(); busy.value = false } }
}
app = createApp({ setup: () => () => h('main', [
  h('h1', 'Maple IndexBar consumer lifecycle · real IAB'),
  h('p', 'Default/light, real components/native RAF. Entry clicks are native; commands and scroll events are fixture-scripted. No OS/native gesture certification.'),
  ...['replacement', 'settlement', 'unmount', 'keepalive'].map(kind => h('button', { disabled: busy.value, onClick: () => run(kind) }, kind)),
  h('div', { class: 'surface', ref: surface }, [mounted.value ? h(KeepAlive, null, () => active.value ? h(Child) : null) : null]),
  ...results.value.map(r => h('p', { 'data-result': r.kind }, `${r.passed ? 'PASS' : 'FAIL'} ${r.kind} · nodes ${r.finalNodes} · changes ${r.events?.filter(e => e.event === 'change').map(e => e.value).join('/')} ${r.error ?? ''}`)),
  h('output', { id: 'results' }, JSON.stringify(results.value, null, 2)),
]) })
app.mount('#app')
window.addEventListener('pagehide', () => {
  alive = false; app.unmount(); restoreScroll?.()
  jobs.forEach((resolve, id) => { clearTimeout(id); resolve() }); jobs.clear()
  frames.forEach((resolve, id) => { cancelAnimationFrame(id); resolve() }); frames.clear()
}, { once: true })
