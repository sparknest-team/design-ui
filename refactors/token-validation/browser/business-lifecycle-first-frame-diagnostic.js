import { createApp, h, KeepAlive, nextTick, ref } from 'vue'
import CedarCountdown from '/cedar-design-web/packages/ui/src/countdown/index.ts'
import CedarNumber from '/cedar-design-web/packages/ui/src/input-number/index.ts'
import MapleCountdown from '/maple-design-mobile/packages/ui/src/countdown/index.ts'
import MapleNumber from '/maple-design-mobile/packages/ui/src/input-number/index.ts'
import '/cedar-design-web/packages/ui/src/input-number/style/index.ts'
import '/maple-design-mobile/packages/ui/src/input-number/style/index.ts'
import '/cedar-design-web/packages/ui/src/countdown/style/index.ts'
import '/maple-design-mobile/packages/ui/src/countdown/style/index.ts'

const results = ref([]),
  busy = ref(false),
  jobs = new Map()
const wait = (ms) =>
  new Promise((resolve) => {
    const id = setTimeout(() => {
      jobs.delete(id)
      resolve()
    }, ms)
    jobs.set(id, resolve)
  })
const states = Object.fromEntries(
  ['Cedar', 'Maple'].map((name) => [
    name,
    {
      mounted: ref(false),
      active: ref(true),
      kind: ref('number'),
      value: ref(0),
      duration: ref(1600),
      instance: ref(),
      events: [],
    },
  ]),
)
let app,
  alive = true
const total = (data) =>
  data.days * 86400000 + data.hours * 3600000 + data.minutes * 60000 + data.seconds * 1000 + data.milliseconds
const nodes = (name) =>
  document.querySelectorAll(
    `[data-owner="${name}"] .c-input-number,[data-owner="${name}"] .mp-input-number,[data-owner="${name}"] .c-countdown,[data-owner="${name}"] .mp-countdown`,
  ).length
function record(s, event, value) {
  s.events.push({ event, value, time: performance.now() })
}
function press(name) {
  const button = [...document.querySelectorAll(`[data-owner="${name}"] button`)].find(
    (node) => node.textContent === 'PLUS',
  )
  if (!button) throw new Error('Real step button missing')
  button.dispatchEvent(
    new PointerEvent('pointerdown', {
      bubbles: true,
      cancelable: true,
      button: 0,
      isPrimary: true,
      pointerType: 'mouse',
    }),
  )
}
async function run(name, kind) {
  if (busy.value) return
  busy.value = true
  const s = states[name],
    start = performance.now(),
    samples = []
  s.events = []
  s.kind.value = kind
  s.active.value = true
  s.value.value = 0
  s.duration.value = 1600
  const snapshot = (phase) =>
    samples.push({
      phase,
      time: performance.now() - start,
      nodes: nodes(name),
      value: s.value.value,
      changes: s.events.filter((e) => e.event === 'change').length,
      updates: s.events.filter((e) => e.event === 'update:modelValue').length,
      ends: s.events.filter((e) => e.event === 'end').length,
      remaining: s.events.filter((e) => e.event === 'change').at(-1)?.value,
    })
  try {
    s.mounted.value = true
    await nextTick()
    snapshot('mounted')
    if (kind === 'number') {
      press(name)
      await nextTick()
      snapshot('immediate-step')
      await wait(700)
      snapshot('before-first-repeat')
      await wait(180)
      snapshot('first-repeat')
      await wait(160)
      snapshot('second-repeat')
      window.dispatchEvent(new PointerEvent('pointercancel'))
      snapshot('cancelled')
      await wait(220)
      snapshot('after-cancel')
      press(name)
      await nextTick()
      snapshot('replacement-hold')
      await wait(100)
      s.mounted.value = false
      await nextTick()
      snapshot('unmounted-pending')
      await wait(850)
      snapshot('after-unmounted-deadline')
      const p = Object.fromEntries(samples.map((x) => [x.phase, x]))
      const passed =
        p['immediate-step'].value === 1 &&
        p['before-first-repeat'].value === 1 &&
        p['first-repeat'].value === 2 &&
        p['second-repeat'].value >= 3 &&
        p.cancelled.value === p['after-cancel'].value &&
        p['after-cancel'].updates === p.cancelled.updates &&
        p['replacement-hold'].value === p.cancelled.value + 1 &&
        p['unmounted-pending'].updates === p['after-unmounted-deadline'].updates &&
        nodes(name) === 0
      results.value.push({
        name,
        kind,
        passed,
        samples,
        events: s.events.map((e) => ({ ...e, time: e.time - start })),
        finalNodes: nodes(name),
      })
    } else {
      await wait(180)
      await new Promise((resolve) => requestAnimationFrame(resolve))
      await nextTick()
      snapshot('running')
      s.instance.value.pause()
      snapshot('paused')
      await wait(220)
      snapshot('paused-stable')
      s.instance.value.start()
      await wait(180)
      await new Promise((resolve) => requestAnimationFrame(resolve))
      await nextTick()
      snapshot('resumed')
      s.active.value = false
      await nextTick()
      snapshot('deactivated')
      await wait(200)
      snapshot('inactive-stable')
      s.duration.value = 900
      await nextTick()
      snapshot('inactive-reset')
      await wait(180)
      snapshot('inactive-reset-stable')
      s.active.value = true
      await nextTick()
      await wait(200)
      await new Promise((resolve) => requestAnimationFrame(resolve))
      await nextTick()
      snapshot('reactivated')
      s.mounted.value = false
      await nextTick()
      snapshot('unmounted')
      await wait(220)
      snapshot('after-unmount')
      const p = Object.fromEntries(samples.map((x) => [x.phase, x]))
      const passed =
        p.running.remaining < 1600 &&
        p.running.changes > p.mounted.changes &&
        p['paused-stable'].changes === p.paused.changes &&
        p.resumed.remaining < p.paused.remaining &&
        p['inactive-stable'].changes === p.deactivated.changes &&
        p['inactive-reset'].remaining === 900 &&
        p['inactive-reset-stable'].changes === p['inactive-reset'].changes &&
        p.reactivated.remaining > 0 &&
        p.reactivated.remaining < 900 &&
        p.reactivated.nodes === 1 &&
        p['after-unmount'].changes === p.unmounted.changes &&
        p['after-unmount'].ends === 0 &&
        nodes(name) === 0
      results.value.push({
        name,
        kind,
        passed,
        samples,
        events: s.events.map((e) => ({ ...e, time: e.time - start })),
        finalNodes: nodes(name),
      })
    }
  } catch (error) {
    results.value.push({ name, kind, passed: false, error: String(error), samples, finalNodes: nodes(name) })
  } finally {
    s.mounted.value = false
    if (alive) {
      await nextTick()
      busy.value = false
    }
  }
}
// Stable cached containers keep their own render effect alive while deactivated,
// so external duration changes reach the real Countdown rather than waiting for activation.
const children = Object.fromEntries(
  ['Cedar', 'Maple'].map((name) => [
    name,
    {
      setup() {
        const s = states[name],
          NumberComponent = name === 'Cedar' ? CedarNumber : MapleNumber,
          Clock = name === 'Cedar' ? CedarCountdown : MapleCountdown
        return () =>
          s.kind.value === 'number'
            ? h(
                NumberComponent,
                {
                  modelValue: s.value.value,
                  mode: 'button',
                  variant: 'filled',
                  min: 0,
                  max: 20,
                  'onUpdate:modelValue': (value) => {
                    s.value.value = value
                    record(s, 'update:modelValue', value)
                  },
                },
                { plus: () => 'PLUS', minus: () => 'MINUS' },
              )
            : h(Clock, {
                ref: s.instance,
                time: s.duration.value,
                format: 'ss:SSS',
                onChange: (data) => record(s, 'change', total(data)),
                onEnd: () => record(s, 'end'),
              })
      },
    },
  ]),
)
app = createApp({
  setup: () => () =>
    h('main', [
      h('h1', 'InputNumber / Countdown Ego Lite 首帧诊断'),
      h(
        'p',
        'default/light；原生入口点击；组件内部pointerdown/pointercancel由夹具脚本触发，Countdown调用公开方法。真实计时／RAF；非原生长按、已出队竞态、跨窗口或OS验收。',
      ),
      h(
        'p',
        { role: 'status' },
        `完成 ${results.value.length}/4；通过 ${results.value.filter((r) => r.passed).length}；失败 ${results.value.filter((r) => !r.passed).length}`,
      ),
      h(
        'div',
        { id: 'cases' },
        ['Cedar', 'Maple'].map((name) => {
          const s = states[name]
          return h('section', { 'data-owner': name }, [
            h('h2', name),
            h('button', { disabled: busy.value, onClick: () => run(name, 'number') }, `${name} number lifecycle`),
            h('button', { disabled: busy.value, onClick: () => run(name, 'countdown') }, `${name} countdown lifecycle`),
            s.mounted.value ? h(KeepAlive, null, { default: () => (s.active.value ? h(children[name]) : null) }) : null,
          ])
        }),
      ),
      h(
        'ul',
        results.value.map((r) =>
          h('li', `${r.name} ${r.kind}: ${r.passed ? 'PASS' : 'FAIL'}; final nodes ${r.finalNodes}`),
        ),
      ),
      h(
        'output',
        { 'aria-label': 'Business lifecycle results' },
        JSON.stringify({ busy: busy.value, results: results.value }, null, 2),
      ),
    ]),
})
app.mount('#app')
window.addEventListener(
  'pagehide',
  () => {
    alive = false
    for (const [id, resolve] of jobs) {
      clearTimeout(id)
      resolve()
    }
    jobs.clear()
    app.unmount()
  },
  { once: true },
)
