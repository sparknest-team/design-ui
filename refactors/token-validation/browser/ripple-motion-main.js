import { createApp, h, withDirectives, ref } from 'vue'
import CedarRipple from '/cedar-design-web/packages/cedar-ui/src/ripple/index.ts'
import MapleRipple from '/maple-design-mobile/packages/maple-ui/src/ripple/index.ts'
import '/cedar-design-web/packages/cedar-ui/src/ripple/style/index.ts'
import '/maple-design-mobile/packages/maple-ui/src/ripple/style/index.ts'

const timing = ref('default'), records = ref([])
const observed = new WeakMap()
const observer = new MutationObserver(mutations => {
  for (const mutation of mutations) {
    for (const wave of mutation.addedNodes) {
      if (!(wave instanceof HTMLElement) || !wave.matches('.c-ripple, .mp-ripple')) continue
      const style = getComputedStyle(wave)
      const record = { platform: wave.classList.contains('c-ripple') ? 'cedar' : 'maple', timing: timing.value,
        duration: style.transitionDuration, properties: style.transitionProperty,
        created: performance.now(), expanded: null, faded: null, removed: null }
      observed.set(wave, record)
      records.value.push(record)
    }
    const wave = mutation.target, record = observed.get(wave)
    if (record && mutation.type === 'attributes') {
      if (wave.style.opacity === '0.25' && record.expanded === null) record.expanded = performance.now()
      if (wave.style.opacity === '0' && record.expanded !== null && record.faded === null) record.faded = performance.now()
    }
    for (const removed of mutation.removedNodes) {
      const record = observed.get(removed)
      if (record) record.removed = performance.now()
    }
  }
  // Plain observer records are not Vue proxies; notify output after their timestamps change.
  records.value = [...records.value]
})
createApp({ setup: () => () => h('main', [
  h('h1', 'Ripple：真实 Token 消费与生命周期'),
  h('select', { 'aria-label': 'Ripple timing', value: timing.value, onChange: e => { timing.value = e.target.value } },
    ['default', 'long', 'zero'].map(value => h('option', { value }, value))),
  ...[['cedar', 'c', CedarRipple], ['maple', 'mp', MapleRipple]].map(([platform, prefix, directive]) =>
    withDirectives(h('button', { 'aria-label': platform + ' ripple', style: timing.value === 'default' ? {} : {
      [`--${prefix}-ripple-expand-duration`]: timing.value === 'long' ? '600ms' : '0ms',
      [`--${prefix}-ripple-fade-duration`]: timing.value === 'long' ? '800ms' : '0ms',
    } }, platform + '：Enter / Space'), [[directive]])),
  h('p', 'default 200ms / 140ms；long 600ms / 800ms；zero 是显式覆写，不是 OS 偏好验收。'),
  h('output', { 'aria-label': 'Ripple records' }, JSON.stringify(records.value, null, 2)),
]) }).mount('#app')
observer.observe(document.querySelector('main'), { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] })
